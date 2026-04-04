import { useState, useCallback } from 'react';
import type { Tattoo, Artist } from '../types';

export interface LightboxEntry { tattoo: Tattoo; artist?: Artist | null }

export function useLightbox() {
  const [entry, setEntry] = useState<LightboxEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  const open = useCallback((tattoo: Tattoo, artist?: Artist | null) => {
    setEntry({ tattoo, artist });
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setMounted(false);
    setTimeout(() => setEntry(null), 320);
  }, []);

  return { entry, mounted, open, close };
}
