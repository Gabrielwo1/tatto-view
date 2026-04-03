import { useState, useEffect } from 'react';

const PHONE = '554699704747';
const MESSAGE = 'Olá! Vi o site da El Dude e gostaria de mais informações sobre tatuagem. 🖤';

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [tooltip, setTooltip] = useState(false);

  // Delay appearance for a smooth entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Stop the pulse animation after a few seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
      className="whatsapp-float"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#25D366',
        boxShadow: '0 4px 20px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        textDecoration: 'none',
        transform: visible ? 'scale(1)' : 'scale(0)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
      }}
    >
      {/* Pulse ring */}
      {pulse && (
        <span
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid rgba(37, 211, 102, 0.5)',
            animation: 'whatsapp-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}

      {/* Tooltip */}
      <span
        style={{
          position: 'absolute',
          right: '72px',
          whiteSpace: 'nowrap',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          padding: '8px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          opacity: tooltip ? 1 : 0,
          transform: tooltip ? 'translateX(0)' : 'translateX(8px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          pointerEvents: 'none',
        }}
      >
        Fale conosco!
        {/* Arrow */}
        <span
          style={{
            position: 'absolute',
            right: '-5px',
            top: '50%',
            marginTop: '-5px',
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '5px solid #1a1a1a',
          }}
        />
      </span>

      {/* WhatsApp SVG icon */}
      <svg
        viewBox="0 0 32 32"
        fill="white"
        style={{ width: '32px', height: '32px', flexShrink: 0 }}
      >
        <path d="M16.004 2.002c-7.732 0-14.002 6.27-14.002 14.002 0 2.468.654 4.876 1.896 6.994l-2.012 7.35 7.536-1.976a13.94 13.94 0 006.582 1.634c7.732 0 14.002-6.27 14.002-14.002S23.736 2.002 16.004 2.002zm0 25.64a11.637 11.637 0 01-5.932-1.624l-.426-.252-4.414 1.158 1.178-4.302-.278-.44A11.6 11.6 0 014.366 16.004c0-6.416 5.222-11.638 11.638-11.638s11.638 5.222 11.638 11.638-5.222 11.638-11.638 11.638zm6.382-8.718c-.35-.176-2.074-1.024-2.396-1.14-.322-.116-.556-.176-.79.176s-.906 1.14-1.112 1.376c-.204.234-.41.264-.76.088-.35-.176-1.478-.546-2.816-1.74-1.04-.928-1.744-2.074-1.948-2.424-.204-.35-.022-.538.154-.712.158-.156.35-.41.526-.614.176-.206.234-.352.352-.586.116-.234.058-.44-.03-.614-.088-.176-.79-1.904-1.082-2.606-.286-.684-.576-.59-.79-.602-.206-.01-.44-.012-.674-.012s-.614.088-.936.44c-.322.35-1.228 1.2-1.228 2.926s1.258 3.394 1.434 3.628c.176.234 2.476 3.782 6 5.302.838.362 1.492.578 2.002.74.842.268 1.608.23 2.214.14.676-.1 2.074-.848 2.366-1.666.292-.818.292-1.52.204-1.666-.088-.146-.322-.234-.674-.41z" />
      </svg>

      {/* Keyframe animation */}
      <style>{`
        @keyframes whatsapp-ping {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        .whatsapp-float:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 28px rgba(37, 211, 102, 0.55), 0 3px 12px rgba(0,0,0,0.35) !important;
        }
        .whatsapp-float:active {
          transform: scale(0.95) !important;
        }
      `}</style>
    </a>
  );
}
