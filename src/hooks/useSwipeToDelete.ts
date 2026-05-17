import type React from 'react';
import { useRef, useState } from 'react';

interface SwipeOptions {
  /** Distance in pixels the card must be dragged left before delete fires. */
  threshold?: number;
  /** Whether a given item is currently locked (e.g. open edit form) and not swipeable. */
  isLocked?: (id: string) => boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * Manages "swipe a list card to the left to delete" interaction for a vertical
 * list of items. Determines axis from the first 5 px of movement and only
 * commits horizontal drags. Vertical scroll is left untouched.
 */
export function useSwipeToDelete(onDelete: (id: string) => void, { threshold = 160, isLocked }: SwipeOptions = {}) {
  const touchRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    determined: boolean;
    isHorizontal: boolean;
  } | null>(null);
  const [offset, setOffset] = useState<{ id: string; px: number } | null>(null);

  function bind(id: string): SwipeHandlers {
    return {
      onTouchStart: (e) => {
        if (isLocked?.(id)) return;
        const t = e.touches[0];
        touchRef.current = { id, startX: t.clientX, startY: t.clientY, determined: false, isHorizontal: false };
      },
      onTouchMove: (e) => {
        const ref = touchRef.current;
        if (!ref || ref.id !== id) return;
        const t = e.touches[0];
        const dx = t.clientX - ref.startX;
        const dy = t.clientY - ref.startY;
        if (!ref.determined && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          ref.isHorizontal = Math.abs(dx) > Math.abs(dy);
          ref.determined = true;
        }
        if (!ref.isHorizontal) return;
        setOffset({ id, px: Math.min(0, dx) });
      },
      onTouchEnd: () => {
        if (!touchRef.current || touchRef.current.id !== id) return;
        const wasHorizontal = touchRef.current.isHorizontal;
        touchRef.current = null;
        const px = offset?.id === id ? offset.px : 0;
        setOffset(null);
        if (wasHorizontal && px <= -threshold) onDelete(id);
      },
    };
  }

  function cardStyle(id: string): React.CSSProperties {
    const px = offset?.id === id ? offset.px : 0;
    return {
      transform: `translateX(${px}px)`,
      transition: offset?.id === id ? 'none' : 'transform 0.22s ease-out',
    };
  }

  function deleteBgOpacity(id: string): number {
    const px = offset?.id === id ? Math.abs(offset.px) : 0;
    return Math.min(1, px / threshold);
  }

  return { bind, cardStyle, deleteBgOpacity, isSwiping: offset !== null };
}
