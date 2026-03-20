import { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const MAX_DISPLAY = 380;
const MIN_CROP = 50;

export default function ImageCropper({ src, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, size: 0 });
  const [loaded, setLoaded] = useState(false);

  // Refs to avoid stale closures in window listeners
  const boxRef = useRef({ x: 0, y: 0, size: 0 });
  const displayRef = useRef({ w: 0, h: 0 });
  const actionRef = useRef<{
    type: 'drag' | 'resize';
    corner?: Corner;
    startMx: number;
    startMy: number;
    startBox: { x: number; y: number; size: number };
  } | null>(null);

  function syncBox(b: { x: number; y: number; size: number }) {
    boxRef.current = b;
    setBox(b);
  }

  function onImgLoad() {
    const img = imgRef.current!;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNatural({ w: nw, h: nh });

    let dw: number, dh: number;
    if (nw >= nh) {
      dw = MAX_DISPLAY;
      dh = Math.round(MAX_DISPLAY * (nh / nw));
    } else {
      dh = MAX_DISPLAY;
      dw = Math.round(MAX_DISPLAY * (nw / nh));
    }
    setDisplay({ w: dw, h: dh });
    displayRef.current = { w: dw, h: dh };

    const size = Math.min(dw, dh);
    syncBox({ x: Math.round((dw - size) / 2), y: Math.round((dh - size) / 2), size });
    setLoaded(true);
  }

  function getPos(e: MouseEvent | React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onBoxDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const p = getPos(e);
    actionRef.current = { type: 'drag', startMx: p.x, startMy: p.y, startBox: { ...boxRef.current } };
  }

  function onCornerDown(corner: Corner) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const p = getPos(e);
      actionRef.current = { type: 'resize', corner, startMx: p.x, startMy: p.y, startBox: { ...boxRef.current } };
    };
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const act = actionRef.current;
      if (!act || !containerRef.current) return;
      const p = getPos(e);
      const dx = p.x - act.startMx;
      const dy = p.y - act.startMy;
      const sb = act.startBox;
      const { w: dw, h: dh } = displayRef.current;

      if (act.type === 'drag') {
        syncBox({
          x: Math.max(0, Math.min(sb.x + dx, dw - sb.size)),
          y: Math.max(0, Math.min(sb.y + dy, dh - sb.size)),
          size: sb.size,
        });
        return;
      }

      let nx = sb.x, ny = sb.y, nsize = sb.size;
      switch (act.corner) {
        case 'br': {
          const delta = Math.max(dx, dy);
          nsize = Math.max(MIN_CROP, Math.min(sb.size + delta, dw - sb.x, dh - sb.y));
          break;
        }
        case 'tl': {
          const delta = Math.max(-dx, -dy);
          nsize = Math.max(MIN_CROP, Math.min(sb.size + delta, sb.x + sb.size, sb.y + sb.size));
          nx = sb.x + sb.size - nsize;
          ny = sb.y + sb.size - nsize;
          break;
        }
        case 'tr': {
          const delta = Math.max(dx, -dy);
          nsize = Math.max(MIN_CROP, Math.min(sb.size + delta, dw - sb.x, sb.y + sb.size));
          ny = sb.y + sb.size - nsize;
          break;
        }
        case 'bl': {
          const delta = Math.max(-dx, dy);
          nsize = Math.max(MIN_CROP, Math.min(sb.size + delta, sb.x + sb.size, dh - sb.y));
          nx = sb.x + sb.size - nsize;
          break;
        }
      }
      syncBox({ x: nx, y: ny, size: nsize });
    }

    function onUp() {
      actionRef.current = null;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function applyPreset(preset: 'center' | 'top' | 'bottom' | 'left' | 'right') {
    const { w: dw, h: dh } = displayRef.current;
    const { size } = boxRef.current;
    const cx = Math.round((dw - size) / 2);
    const cy = Math.round((dh - size) / 2);
    const presets = {
      center: { x: cx, y: cy },
      top:    { x: cx, y: 0 },
      bottom: { x: cx, y: dh - size },
      left:   { x: 0,  y: cy },
      right:  { x: dw - size, y: cy },
    };
    syncBox({ ...boxRef.current, ...presets[preset] });
  }

  function applyCrop() {
    const img = imgRef.current!;
    const scaleX = natural.w / display.w;
    const scaleY = natural.h / display.h;
    const sx = Math.round(box.x * scaleX);
    const sy = Math.round(box.y * scaleY);
    const sw = Math.round(box.size * scaleX);
    const sh = Math.round(box.size * scaleY);
    const outSize = Math.min(sw, sh, 1200);

    const canvas = document.createElement('canvas');
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d')!;
    try {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outSize, outSize);
      onConfirm(canvas.toDataURL('image/jpeg', 0.92));
    } catch {
      onConfirm(src); // fallback if CORS blocks canvas read
    }
  }

  const scaleX = natural.w > 0 ? natural.w / display.w : 1;
  const scaleY = natural.h > 0 ? natural.h / display.h : 1;
  const outW = Math.round(box.size * scaleX);
  const outH = Math.round(box.size * scaleY);

  const aspectLabel =
    natural.w === 0 ? '—'
    : natural.w === natural.h ? 'Quadrado (1:1) ✓'
    : natural.w > natural.h  ? `Horizontal (${natural.w}:${natural.h})`
    : `Vertical (${natural.w}:${natural.h})`;

  const isIdeal = natural.w > 0 && natural.w === natural.h;

  return (
    <div className="border border-amber-400/30 bg-zinc-950 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-body text-[10px] font-semibold tracking-widest uppercase text-amber-400/80">
          Ajustar recorte
        </p>
        <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase">
          Grade: quadrado 1:1
        </p>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-3 gap-2 border border-white/10 p-3">
        <div className="text-center">
          <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-1">Original</p>
          <p className="font-body text-xs text-white/70">{natural.w > 0 ? `${natural.w}×${natural.h}` : '…'}</p>
          <p className="font-body text-[10px] text-gray-500 mt-0.5">{aspectLabel}</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-1">Recorte</p>
          <p className="font-body text-xs text-white/70">{outW > 0 ? `${outW}×${outH}` : '…'}</p>
          <p className="font-body text-[10px] text-gray-500 mt-0.5">px</p>
        </div>
        <div className="text-center">
          <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-1">Ideal</p>
          <p className={`font-body text-xs ${isIdeal ? 'text-green-400' : 'text-amber-400'}`}>
            {isIdeal ? '✓ Perfeito' : 'Recortar'}
          </p>
          <p className="font-body text-[10px] text-gray-500 mt-0.5">1:1 quadrado</p>
        </div>
      </div>

      {!isIdeal && (
        <p className="font-body text-[10px] text-amber-400/70 tracking-wide">
          ↳ Arraste ou redimensione o quadrado para escolher a área do recorte
        </p>
      )}

      {/* Crop canvas */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative select-none overflow-hidden bg-zinc-900"
          style={{ width: display.w || MAX_DISPLAY, height: display.h || MAX_DISPLAY }}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={onImgLoad}
            draggable={false}
            crossOrigin="anonymous"
            className="absolute inset-0 pointer-events-none"
            style={{ width: display.w || MAX_DISPLAY, height: display.h || MAX_DISPLAY, objectFit: 'fill' }}
          />

          {loaded && (
            <>
              {/* Dark overlay */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={display.w}
                height={display.h}
              >
                <defs>
                  <mask id="img-crop-mask">
                    <rect width={display.w} height={display.h} fill="white" />
                    <rect x={box.x} y={box.y} width={box.size} height={box.size} fill="black" />
                  </mask>
                </defs>
                <rect width={display.w} height={display.h} fill="rgba(0,0,0,0.6)" mask="url(#img-crop-mask)" />
              </svg>

              {/* Crop box */}
              <div
                className="absolute border border-white cursor-move"
                style={{ left: box.x, top: box.y, width: box.size, height: box.size }}
                onMouseDown={onBoxDown}
              >
                {/* Rule of thirds */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '33.33% 33.33%',
                  }}
                />

                {/* Corner handles */}
                {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => (
                  <div
                    key={c}
                    className="absolute w-3 h-3 bg-white border border-black z-10"
                    style={{
                      cursor: c === 'tl' || c === 'br' ? 'nwse-resize' : 'nesw-resize',
                      top:    c.startsWith('t') ? -5 : undefined,
                      bottom: c.startsWith('b') ? -5 : undefined,
                      left:   c.endsWith('l')   ? -5 : undefined,
                      right:  c.endsWith('r')   ? -5 : undefined,
                    }}
                    onMouseDown={onCornerDown(c)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick position presets */}
      <div>
        <p className="font-body text-[10px] text-gray-600 tracking-widest uppercase mb-2">Posição rápida</p>
        <div className="flex flex-wrap gap-1.5">
          {(['center', 'top', 'bottom', 'left', 'right'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body text-[10px] tracking-widest uppercase transition-colors"
            >
              {{ center: 'Centro', top: 'Topo', bottom: 'Base', left: 'Esq.', right: 'Dir.' }[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={applyCrop}
          className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors"
        >
          Aplicar recorte
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
