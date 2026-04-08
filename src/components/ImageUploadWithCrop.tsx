import { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

interface ImageUploadWithCropProps {
  label: string;
  onImageUrl: (url: string) => void;
  initialUrl?: string;
  onUpload?: (file: File) => Promise<string>;
  aspectRatio?: '1:1' | '16:9' | '3:4';
}

export default function ImageUploadWithCrop({ 
  label, 
  onImageUrl, 
  initialUrl, 
  onUpload,
  aspectRatio = '1:1'
}: ImageUploadWithCropProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show cropper
    const localPreview = URL.createObjectURL(file);
    setCropSrc(localPreview);
    setPendingFile(file);
  }

  function handleCropConfirm(dataUrl: string) {
    setCropSrc(null);
    setPreview(dataUrl);
    
    // Convert dataUrl to file and upload
    if (onUpload) {
      setIsLoading(true);
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'cropped-image.webp', { type: 'image/webp' });
          return onUpload(file);
        })
        .then(url => {
          onImageUrl(url);
          setPreview(url);
        })
        .catch(err => {
          console.error('Upload failed:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      onImageUrl(dataUrl);
    }
  }

  function handleCropCancel() {
    setCropSrc(null);
    setPendingFile(null);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      {cropSrc && (
        <ImageCropper 
          src={cropSrc} 
          onConfirm={handleCropConfirm} 
          onCancel={handleCropCancel}
        />
      )}
      
      {label && (
        <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
          {label}
        </label>
      )}
      
      <div className="flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isLoading}
          className="w-full bg-transparent border border-white/15 px-3 py-2 text-white text-xs font-body focus:outline-none focus:border-white transition-colors disabled:opacity-50 hover:border-white/30"
        >
          {isLoading ? 'Enviando...' : 'Escolher arquivo'}
        </button>
        
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
