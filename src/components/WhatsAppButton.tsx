import { useState, useEffect } from 'react';
import { useStore } from '../store';

const STUDIO_PHONE = '554699704747';
const DEFAULT_MSG = 'Olá! Vi o site e gostaria de mais informações. 🖤';

export default function WhatsAppButton() {
  const artists = useStore((s) => s.artists);
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `Olá ${name}! Vi seu trabalho no site da El Dude e gostaria de fazer um orçamento. 🖤`;
    const url = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 10000 }}>
      {/* The Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="whatsapp-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#25D366',
            boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)',
            border: 'none',
            cursor: 'pointer',
            transform: visible ? 'scale(1)' : 'scale(0)',
            opacity: visible ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg viewBox="0 0 32 32" fill="white" style={{ width: '30px', height: '30px' }}>
            <path d="M16.004 2.002c-7.732 0-14.002 6.27-14.002 14.002 0 2.468.654 4.876 1.896 6.994l-2.012 7.35 7.536-1.976a13.94 13.94 0 006.582 1.634c7.732 0 14.002-6.27 14.002-14.002S23.736 2.002 16.004 2.002zm0 25.64a11.637 11.637 0 01-5.932-1.624l-.426-.252-4.414 1.158 1.178-4.302-.278-.44A11.6 11.6 0 014.366 16.004c0-6.416 5.222-11.638 11.638-11.638s11.638 5.222 11.638 11.638-5.222 11.638-11.638 11.638zm6.382-8.718c-.35-.176-2.074-1.024-2.396-1.14-.322-.116-.556-.176-.79.176s-.906 1.14-1.112 1.376c-.204.234-.41.264-.76.088-.35-.176-1.478-.546-2.816-1.74-1.04-.928-1.744-2.074-1.948-2.424-.204-.35-.022-.538.154-.712.158-.156.35-.41.526-.614.176-.206.234-.352.352-.586.116-.234.058-.44-.03-.614-.088-.176-.79-1.904-1.082-2.606-.286-.684-.576-.59-.79-.602-.206-.01-.44-.012-.674-.012s-.614.088-.936.44c-.322.35-1.228 1.2-1.228 2.926s1.258 3.394 1.434 3.628c.176.234 2.476 3.782 6 5.302.838.362 1.492.578 2.002.74.842.268 1.608.23 2.214.14.676-.1 2.074-.848 2.366-1.666.292-.818.292-1.52.204-1.666-.088-.146-.322-.234-.674-.41z" />
          </svg>
        </button>
      )}

      {/* The Pop-up / Modal */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '320px',
            maxHeight: '480px',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'wa-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ background: '#25D366', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Agende sua Tattoo</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.9 }}>Escolha com quem você quer falar:</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="wa-list scrollbar-hide">
            {/* General Studio Option */}
            <button
              onClick={() => {
                const url = `https://wa.me/${STUDIO_PHONE}?text=${encodeURIComponent(DEFAULT_MSG)}`;
                window.open(url, '_blank');
              }}
              className="wa-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '12px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/dudeicone.png" alt="Studio" style={{ width: '24px', opacity: 0.8 }} />
              </div>
              <div>
                <span style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600 }}>El Dude (Geral)</span>
                <span style={{ fontSize: '11px', color: '#666' }}>Falar com a recepção</span>
              </div>
            </button>

            <div style={{ fontSize: '10px', color: '#444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0 8px 4px' }}>Artistas</div>

            {artists.map((artist) => {
              const hasWhatsApp = artist.whatsapp && artist.whatsapp.replace(/\D/g, '').length >= 10;
              
              // Handle specific artists that prefer Instagram as mentioned by the user
              const nameLower = artist.name.toLowerCase();
              const prefersInstagram = nameLower.includes('matheus') || nameLower.includes('joao victor') || !hasWhatsApp;

              return (
                <button
                  key={artist.id}
                  onClick={() => {
                    if (prefersInstagram && artist.instagram) {
                      const instaUser = artist.instagram.replace(/.*instagram\.com\//, '').replace(/\//g, '');
                      window.open(`https://instagram.com/${instaUser}`, '_blank');
                    } else {
                      openWhatsApp(artist.whatsapp || STUDIO_PHONE, artist.name);
                    }
                  }}
                  className="wa-item"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <img
                    src={artist.photoUrl || '/placeholder-artist.png'}
                    alt={artist.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', color: '#eee', fontSize: '13px', fontWeight: 500 }}>{artist.name}</span>
                    <span style={{ fontSize: '11px', color: '#555' }}>
                      {prefersInstagram ? 'Falar pelo Instagram 📸' : 'Falar pelo WhatsApp 💬'}
                    </span>
                  </div>
                  <div 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: prefersInstagram ? '#E1306C' : '#25D366', 
                      opacity: 0.6 
                    }} 
                  />
                </button>
              );
            })}

          </div>
        </div>
      )}

      <style>{`
        @keyframes wa-slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .wa-list::-webkit-scrollbar { display: none; }
        .wa-item:hover {
          background: rgba(255,255,255,0.08) !important;
          transform: translateX(4px);
        }
        .whatsapp-trigger:hover {
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}
