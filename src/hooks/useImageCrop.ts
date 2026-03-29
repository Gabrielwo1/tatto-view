import { useState, useRef, useEffect } from 'react';

/**
 * Encapsulates the repeated crop-before-upload flow used across admin pages.
 *
 * Usage:
 *   const { cropSrc, fileInputRef, handleFileChange, handleCropConfirm, handleCropCancel } =
 *     useImageCrop((dataUrl) => setForm((f) => ({ ...f, photoUrl: dataUrl })));
 */
export function useImageCrop(onConfirm: (dataUrl: string) => void) {
  const [cropSrc, setCropSrc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);

  // Abort any in-flight FileReader when the component using this hook unmounts.
  useEffect(() => {
    return () => { readerRef.current?.abort(); };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setCropSrc(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleCropConfirm(dataUrl: string) {
    onConfirm(dataUrl);
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleCropCancel() {
    setCropSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return { cropSrc, fileInputRef, handleFileChange, handleCropConfirm, handleCropCancel, openFilePicker };
}
