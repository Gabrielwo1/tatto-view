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

    // Upload if handler provided
    if (onUpload) {
      setIsLoading(true);
      try {
        const url = await onUpload(file);
        onImageUrl(url);
      } catch (err) {
        console.error('Upload failed:', err);
        setPreview(null);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div>
      <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
        {label}
      </label>
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="w-full bg-transparent border border-white/15 px-4 py-2.5 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black file:cursor-pointer hover:file:bg-gray-100"
          />
          {isLoading && <p className="text-xs text-gray-500 mt-2">Enviando...</p>}
        </div>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 object-cover border border-white/10 flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
    </div>
  );
}
