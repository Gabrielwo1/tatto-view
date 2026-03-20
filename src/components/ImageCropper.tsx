import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const MAX_DISPLAY = 300;
const MIN_CROP = 40;

export default function ImageCropper({ src, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, size: 0 });
  const [loaded, setLoaded] = useState(false);

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

  function startDrag(mx: number, my: number) {
    actionRef.current = { type: 'drag', startMx: mx, startMy: my, startBox: { ...boxRef.current } };
  }

  function startResize(corner: Corner, mx: number, my: number) {
    actionRef.current = { type: 'resize', corner, startMx: mx, startMy: my, startBox: { ...boxRef.current } };
  }

  const onMove = useCallback((mx: number, my: number) => {
    const act = actionRef.current;
    if (!act) return;
    const dx = mx - act.startMx;
    const dy = my - act.startMy;
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
        const d = Math.max(dx, dy);
        nsize = Math.max(MIN_CROP, Math.min(sb.size + d, dw - sb.x, dh - sb.y));
        break;
      }
      case 'tl': {
        const d = Math.max(-dx, -dy);
        nsize = Math.max(MIN_CROP, Math.min(sb.size + d, sb.x + sb.size, sb.y + sb.size));
        nx = sb.x + sb.size - nsize;
        ny = sb.y + sb.size - nsize;
        break;
      }
      case 'tr': {
        const d = Math.max(dx, -dy);
        nsize = Math.max(MIN_CROP, Math.min(sb.size + d, dw - sb.x, sb.y + sb.size));
        ny = sb.y + sb.size - nsize;
        break;
      }
      case 'bl': {
        const d = Math.max(-dx, dy);
        nsize = Math.max(MIN_CROP, Math.min(sb.size + d, sb.x + sb.size, dh - sb.y));
        nx = sb.x + sb.size - nsize;
        break;
      }
    }
    syncBox({ x: nx, y: ny, size: nsize });
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      onMove(e.clientX - r.left, e.clientY - r.top);
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      const r = containerRef.current?.getBoundingClientRect();
      if (!r || !t) return;
      onMove(t.clientX - r.left, t.clientY - r.top);
    }
    function onUp() { actionRef.current = null; }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [onMove]);

  // Slider controls the crop size as % of the min dimension
  const maxSize = loaded ? Math.min(displayRef.current.w, displayRef.current.h) : MAX_DISPLAY;
  const sliderPct = loaded ? Math.round((box.size / maxSize) * 100) : 100;

  function onSliderChange(pct: number) {
    const { w: dw, h: dh } = displayRef.current;
    const newSize = Math.max(MIN_CROP, Math.round((pct / 100) * Math.min(dw, dh)));
    const cx = boxRef.current.x + boxRef.current.size / 2;
    const cy = boxRef.current.y + boxRef.current.size / 2;
    syncBox({
      x: Math.max(0, Math.min(Math.round(cx - newSize / 2), dw - newSize)),
      y: Math.max(0, Math.min(Math.round(cy - newSize / 2), dh - newSize)),
      size: newSize,
    });
  }

  function applyPreset(pos: 'center' | 'top' | 'bottom' | 'left' | 'right') {
    const { w: dw, h: dh } = displayRef.current;
    const { size } = boxRef.current;
    const cx = Math.round((dw - size) / 2);
    const cy = Math.round((dh - size) / 2);
    const map = { center: { x: cx, y: cy }, top: { x: cx, y: 0 }, bottom: { x: cx, y: dh - size }, left: { x: 0, y: cy }, right: { x: dw - size, y: cy } };
    syncBox({ ...boxRef.current, ...map[pos] });
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
      onConfirm(src);
    }
  }

  const HANDLE = 18; // handle size px

  return (
    <div className="border border-amber-400/40 bg-zinc-950">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="font-body text-[10px] font-bold tracking-widest uppercase text-amber-400">
          Recortar imagem
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="font-body text-[10px] text-gray-600 hover:text-white tracking-widest uppercase transition-colors"
        >
          Usar sem recortar
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Canvas */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden bg-zinc-900 cursor-move touch-none"
            style={{ width: display.w || MAX_DISPLAY, height: display.h || MAX_DISPLAY }}
            onMouseDown={(e) => {
              // only start drag if clicking outside the box area (direct container click = nothing)
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              const t = e.touches[0];
              const r = e.currentTarget.getBoundingClientRect();
              startDrag(t.clientX - r.left, t.clientY - r.top);
            }}
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
                {/* Dark overlay with hole */}
                <svg className="absolute inset-0 pointer-events-none" width={display.w} height={display.h}>
                  <defs>
                    <mask id="crop-hole">
                      <rect width={display.w} height={display.h} fill="white" />
                      <rect x={box.x} y={box.y} width={box.size} height={box.size} fill="black" />
                    </mask>
                  </defs>
                  <rect width={display.w} height={display.h} fill="rgba(0,0,0,0.65)" mask="url(#crop-hole)" />
                  {/* Crop border */}
                  <rect x={box.x} y={box.y} width={box.size} height={box.size} fill="none" stroke="white" strokeWidth="1.5" />
                  {/* Rule of thirds */}
                  <line x1={box.x + box.size / 3} y1={box.y} x2={box.x + box.size / 3} y2={box.y + box.size} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1={box.x + (box.size * 2) / 3} y1={box.y} x2={box.x + (box.size * 2) / 3} y2={box.y + box.size} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1={box.x} y1={box.y + box.size / 3} x2={box.x + box.size} y2={box.y + box.size / 3} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1={box.x} y1={box.y + (box.size * 2) / 3} x2={box.x + box.size} y2={box.y + (box.size * 2) / 3} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                </svg>

                {/* Draggable crop area */}
                <div
                  className="absolute cursor-move"
                  style={{ left: box.x, top: box.y, width: box.size, height: box.size }}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const r = containerRef.current!.getBoundingClientRect(); startDrag(e.clientX - r.left, e.clientY - r.top); }}
                  onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; const r = containerRef.current!.getBoundingClientRect(); startDrag(t.clientX - r.left, t.clientY - r.top); }}
                />

                {/* Corner handles */}
                {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => (
                  <div
                    key={c}
                    className="absolute bg-amber-400 z-10 touch-none"
                    style={{
                      width: HANDLE, height: HANDLE,
                      cursor: c === 'tl' || c === 'br' ? 'nwse-resize' : 'nesw-resize',
                      top:    c.startsWith('t') ? box.y - HANDLE / 2 : undefined,
                      bottom: c.startsWith('b') ? display.h - box.y - box.size - HANDLE / 2 : undefined,
                      left:   c.endsWith('l')   ? box.x - HANDLE / 2 : undefined,
                      right:  c.endsWith('r')   ? display.w - box.x - box.size - HANDLE / 2 : undefined,
                    }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); const r = containerRef.current!.getBoundingClientRect(); startResize(c, e.clientX - r.left, e.clientY - r.top); }}
                    onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; const r = containerRef.current!.getBoundingClientRect(); startResize(c, t.clientX - r.left, t.clientY - r.top); }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Instruction */}
        <p className="text-center font-body text-[10px] text-gray-600 tracking-wide">
          Arraste a área ou os cantos laranja para ajustar o recorte
        </p>

        {/* Size slider */}
        {loaded && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body text-[10px] text-gray-500 tracking-widest uppercase">Tamanho do recorte</span>
              <span className="font-body text-[10px] text-gray-400">{sliderPct}%</span>
            </div>
            <input
              type="range"
              min={Math.round((MIN_CROP / maxSize) * 100)}
              max={100}
              value={sliderPct}
              onChange={(e) => onSliderChange(Number(e.target.value))}
              className="w-full accent-amber-400 h-1 cursor-pointer"
            />
          </div>
        )}

        {/* Position presets — D-pad layout */}
        {loaded && (
          <div className="flex items-center gap-4">
            <span className="font-body text-[10px] text-gray-500 tracking-widest uppercase whitespace-nowrap">Posição</span>
            <div className="grid grid-cols-3 gap-1" style={{ width: 84 }}>
              <div />
              <button type="button" onClick={() => applyPreset('top')}   className="p-1.5 border border-white/15 hover:border-amber-400/60 hover:text-amber-400 text-gray-500 flex items-center justify-center transition-colors" title="Topo">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              <div />
              <button type="button" onClick={() => applyPreset('left')}  className="p-1.5 border border-white/15 hover:border-amber-400/60 hover:text-amber-400 text-gray-500 flex items-center justify-center transition-colors" title="Esquerda">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" onClick={() => applyPreset('center')} className="p-1.5 border border-white/15 hover:border-amber-400/60 hover:text-amber-400 text-gray-500 flex items-center justify-center transition-colors" title="Centro">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /></svg>
              </button>
              <button type="button" onClick={() => applyPreset('right')} className="p-1.5 border border-white/15 hover:border-amber-400/60 hover:text-amber-400 text-gray-500 flex items-center justify-center transition-colors" title="Direita">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div />
              <button type="button" onClick={() => applyPreset('bottom')} className="p-1.5 border border-white/15 hover:border-amber-400/60 hover:text-amber-400 text-gray-500 flex items-center justify-center transition-colors" title="Base">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div />
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button
          type="button"
          onClick={applyCrop}
          className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
        >
          Confirmar recorte
        </button>
      </div>
    </div>
  );
}
