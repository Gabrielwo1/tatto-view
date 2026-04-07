import { useState, type FormEvent } from 'react';
import type { Artist } from '../types';

interface ContactModalProps {
  artist: Artist;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ artist, isOpen, onClose }: ContactModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Redirect to WhatsApp or Instagram based on preference
    const contactUrl = artist.whatsapp || artist.instagram || '';
    if (!contactUrl) return;

    let message = `Olá ${artist.name}! Gostaria de agendar uma tatuagem. Meu nome é ${form.name}, email: ${form.email}. ${form.message}`;
    
    if (artist.whatsapp) {
      // WhatsApp format: remove special chars from URL and append message
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (artist.instagram) {
      window.open(artist.instagram, '_blank');
    }

    setForm({ name: '', email: '', message: '' });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md mx-4 bg-black border border-white/10 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white uppercase tracking-wide">Contato</h2>
            <p className="font-body text-xs text-gray-500 mt-1">{artist.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Seu Nome *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block font-body text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              Mensagem/Descrição da Tatuagem
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="w-full bg-transparent border border-white/15 px-3 py-2 text-white text-sm font-body placeholder-gray-700 focus:outline-none focus:border-white transition-colors resize-none"
              placeholder="Descreva a tatuagem que você quer..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-white hover:bg-gray-100 text-black font-body font-bold text-xs tracking-widest uppercase py-2.5 transition-colors"
            >
              Enviar via {artist.whatsapp ? 'WhatsApp' : 'Instagram'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-white/15 hover:border-white text-gray-500 hover:text-white font-body font-bold text-xs tracking-widest uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
