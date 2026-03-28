import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface Props {
  itemType: 'tattoo' | 'merch';
  itemId: string;
  className?: string;
}

export default function WishlistButton({ itemType, itemId, className = '' }: Props) {
  const publicUser = useStore((s) => s.publicUser);
  const wishlist = useStore((s) => s.wishlist);
  const addToWishlist = useStore((s) => s.addToWishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const navigate = useNavigate();

  const isSaved = wishlist.some((w) => w.itemType === itemType && w.itemId === itemId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!publicUser) { navigate('/login'); return; }
    if (isSaved) removeFromWishlist(itemType, itemId);
    else addToWishlist(itemType, itemId);
  }

  return (
    <button
      onClick={handleClick}
      title={isSaved ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
      className={`flex items-center justify-center w-8 h-8 transition-colors ${
        isSaved ? 'text-red-500' : 'text-white/30 hover:text-red-400'
      } ${className}`}
    >
      <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}
