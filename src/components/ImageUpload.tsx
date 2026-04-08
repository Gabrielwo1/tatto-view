import { useState, useEffect } from 'react';

interface ImageUploadProps {
  label: string;
  onImageUrl: (url: string) => void;
  initialUrl?: string;
  onUpload?: (file: File) => Promise<string>;
}

export default function ImageUpload({ label, onImageUrl, initialUrl, onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);

  // Update preview when initialUrl changes
  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    console.log('[ImageUpload] Local preview set:', localPreview);

    // Upload if handler provided
    if (onUpload) {
      setIsLoading(true);
      try {
        console.log('[ImageUpload] Starting upload...');
        const url = await onUpload(file);
        console.log('[ImageUpload] Upload success, URL:', url);
        onImageUrl(url);
        setPreview(url); // Update to the server URL
      } catch (err) {
        console.error('[ImageUpload] Upload failed:', err);
        // Keep the local preview on error, don't clear it
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full bg-transparent border border-white/15 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white transition-colors disabled:opacity-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-none file:border-0 file:text-[10px] file:font-semibold file:bg-white/10 file:text-white file:cursor-pointer hover:file:bg-white/20"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {preview && (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-square object-cover border border-white/10 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {!preview && !isLoading && (
          <div className="w-full aspect-square bg-white/5 border border-white/10 border-dashed rounded-sm flex items-center justify-center">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Sem imagem</span>
          </div>
        )}
      </div>
    </div>
  );
}
