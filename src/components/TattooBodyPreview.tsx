import { useState, useRef } from 'react';
import { generateFluxPreview, buildTattooPrompt } from '../lib/fluxPreview';

const PLACEMENTS = ['forearm','arm','shoulder','back','chest','leg','calf','ribs','neck','hand','foot','thigh'];

interface Props {
  tattooImageUrl: string;
  tattooTitle: string;
  onClose: () => void;
}

export default function TattooBodyPreview({ tattooImageUrl, tattooTitle, onClose }: Props) {
  const [step, setStep] = useState<'upload' | 'generating' | 'result' | 'error'>('upload');
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [placement, setPlacement] = useState('forearm');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBodyFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBodyPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!bodyFile) return;
    setStep('generating');
    setErrorMsg('');
    try {
      const fluxPrompt = buildTattooPrompt(tattooTitle, placement);
      const { url } = await generateFluxPreview(fluxPrompt);
      setImgLoaded(false);
      setResultImage(url);
      setStep('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar preview. Tente novamente.';
      setErrorMsg(msg);
      setStep('error');
    }
  }

  function handleDownload() {
    if (!resultImage) return;
    window.open(resultImage, '_blank');
  }

  function handleRetry() {
    setStep('upload');
    setBodyPreview(null);
    setBodyFile(null);
    setResultImage(null);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-zinc-950 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-950 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-body text-[10px] font-bold tracking-widest uppercase text-ink-500 mb-1">
              Preview com IA
            </p>
            <h2 className="font-display text-xl uppercase tracking-wide text-white leading-none">
              Testar no Corpo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ─── STEP: Upload ─── */}
          {step === 'upload' && (
            <>
              {/* Tattoo being tested */}
              <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-white/5">
                <img
                  src={tattooImageUrl}
                  alt={tattooTitle}
                  className="w-16 h-16 object-cover border border-white/10 flex-shrink-0"
                />
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-gray-500">Tatuagem selecionada</p>
                  <p className="font-display text-sm uppercase text-white mt-0.5">{tattooTitle}</p>
                </div>
              </div>

              {/* Upload area */}
              <div>
                <p className="font-body text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-3">
                  Foto do corpo
                </p>
                <p className="font-body text-xs text-gray-500 mb-4 leading-relaxed">
                  Envie uma foto da parte do corpo onde deseja a tatuagem.
                  Fotos com boa iluminação e pele visível geram melhores resultados.
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {bodyPreview ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={bodyPreview}
                        alt="Foto do corpo"
                        className="w-full max-h-[45vh] object-contain border border-white/10 bg-black"
                      />
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="absolute top-2 right-2 bg-black/80 border border-white/20 text-white/50 hover:text-white p-1.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mb-3">
                      <p className="font-body text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
                        Local do corpo
                      </p>
                      <select
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/15 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-ink-500 transition-colors"
                      >
                        {PLACEMENTS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleGenerate}
                      className="w-full py-3.5 bg-ink-500 hover:bg-ink-400 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Gerar Preview com IA
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-white/15 hover:border-ink-500/50 py-10 flex flex-col items-center gap-3 text-gray-500 hover:text-ink-500 transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-body text-xs font-bold tracking-widest uppercase">
                        Enviar foto
                      </span>
                      <span className="font-body text-[10px] text-gray-600 tracking-wide">
                        Galeria ou Câmera
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── STEP: Generating ─── */}
          {step === 'generating' && (
            <div className="py-16 flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-2 border-ink-500/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
                <svg className="absolute inset-0 m-auto w-8 h-8 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-xl uppercase tracking-wide text-white mb-2">
                  Gerando Preview...
                </p>
                <p className="font-body text-xs text-gray-500 max-w-xs leading-relaxed">
                  O Flux está criando sua prévia. Isso pode levar alguns segundos.
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP: Result ─── */}
          {step === 'result' && resultImage && (
            <div className="space-y-4">
              <div className="relative w-full bg-black border border-white/10 min-h-[200px] flex items-center justify-center">
                {!imgLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-body text-[10px] text-gray-500 tracking-widest uppercase">Carregando imagem...</p>
                  </div>
                )}
                <img
                  src={resultImage}
                  alt="Preview da tatuagem no corpo"
                  className={`w-full max-h-[60vh] object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setErrorMsg('Não foi possível carregar a imagem gerada. Tente novamente.'); setStep('error'); }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-ink-500 hover:bg-ink-400 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar
                </button>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
                >
                  Outra foto
                </button>
              </div>

              {/* Disclaimer */}
              <p className="font-body text-[10px] text-gray-700 text-center leading-relaxed tracking-wide">
                ✦ Preview gerado por inteligência artificial — resultado meramente ilustrativo. 
                O resultado final pode variar conforme a aplicação do artista.
              </p>
            </div>
          )}

          {/* ─── STEP: Error ─── */}
          {step === 'error' && (
            <div className="py-12 flex flex-col items-center gap-5">
              <div className="w-16 h-16 border border-red-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-display text-lg uppercase tracking-wide text-white mb-2">
                  Erro na geração
                </p>
                <p className="font-body text-xs text-gray-500 max-w-sm leading-relaxed">
                  {errorMsg || 'Não foi possível gerar o preview. Tente novamente com outra foto.'}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
