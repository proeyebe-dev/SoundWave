import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Carrousel horizontal scrollable
 *
 * Props :
 * @param {string} title - Titre de la section
 * @param {string} [seeAllLink] - Lien "Voir tout"
 * @param {React.ReactNode} children - Cards à afficher
 * @param {boolean} [isLoading] - Affiche un skeleton si true
 * @param {number} [skeletonCount] - Nombre de skeletons à afficher
 */
export default function Carousel({
  title,
  seeAllLink,
  children,
  isLoading = false,
  skeletonCount = 6,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // --- Scroll detection -------------------------------------------------------

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState, children]);

  // --- Scroll handlers --------------------------------------------------------

  function scrollByAmount(direction) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  // --- Render -----------------------------------------------------------------

  return (
    <section className="mb-8">
      {/* En-tête de section */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-white text-xl font-bold tracking-tight">{title}</h2>
        {seeAllLink && (
          <a
            href={seeAllLink}
            className="text-neutral-400 hover:text-white text-xs font-semibold
                       uppercase tracking-widest transition-colors duration-150"
          >
            Voir tout
          </a>
        )}
      </div>

      {/* Zone scrollable + boutons */}
      <div className="relative group/carousel">
        {/* Bouton gauche */}
        <ScrollButton
          direction="left"
          onClick={() => scrollByAmount(-1)}
          visible={canScrollLeft}
        />

        {/* Liste scrollable */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2
                     scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            : children}
        </div>

        {/* Bouton droit */}
        <ScrollButton
          direction="right"
          onClick={() => scrollByAmount(1)}
          visible={canScrollRight}
        />
      </div>
    </section>
  );
}

// --- Sous-composants ---------------------------------------------------------

function ScrollButton({ direction, onClick, visible }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 rounded-full bg-white/90 shadow-lg
                  flex items-center justify-center
                  hover:bg-white hover:scale-110
                  transition-all duration-200
                  ${direction === 'left' ? '-left-4' : '-right-4'}
                  ${visible
                    ? 'opacity-0 group-hover/carousel:opacity-100'
                    : 'opacity-0 pointer-events-none'}`}
      aria-label={direction === 'left' ? 'Défiler à gauche' : 'Défiler à droite'}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 text-black ${direction === 'left' ? 'rotate-180' : ''}`}
      >
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      </svg>
    </button>
  );
}

/** Skeleton d'une card pendant le chargement */
function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-40 animate-pulse">
      <div className="w-full aspect-square rounded-lg bg-neutral-800 mb-3" />
      <div className="h-3 bg-neutral-800 rounded w-3/4 mb-2" />
      <div className="h-2.5 bg-neutral-800 rounded w-1/2" />
    </div>
  );
}