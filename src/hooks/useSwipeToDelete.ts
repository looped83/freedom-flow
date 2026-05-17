import type React from 'react';
import { useRef } from 'react';

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
 *
 * Uses direct DOM mutation during the active drag instead of React state so
 * touchmove at 60 fps never schedules a React re-render of the full list.
 * Callers attach setCardEl / setBgEl as callback refs; isSwipingRef lets
 * click handlers guard against accidental taps after a swipe.
 */
export function useSwipeToDelete(onDelete: (id: string) => void, { threshold = 160, isLocked }: SwipeOptions = {}) {
  const touchRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    determined: boolean;
    isHorizontal: boolean;
    currentPx: number;
  } | null>(null);

  const isSwipingRef = useRef(false);
  const cardEls = useRef(new Map<string, HTMLElement>());
  const bgEls   = useRef(new Map<string, HTMLElement>());

  function setCardEl(id: string, el: HTMLElement | null) {
    if (el) cardEls.current.set(id, el);
    else cardEls.current.delete(id);
  }

  function setBgEl(id: string, el: HTMLElement | null) {
    if (el) bgEls.current.set(id, el);
    else bgEls.current.delete(id);
  }

  function bind(id: string): SwipeHandlers {
    return {
      onTouchStart: (e) => {
        if (isLocked?.(id)) return;
        const t = e.touches[0];
        touchRef.current = {
          id, startX: t.clientX, startY: t.clientY,
          determined: false, isHorizontal: false, currentPx: 0,
        };
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

        const px = Math.min(0, dx);
        ref.currentPx = px;
        isSwipingRef.current = true;

        const cardEl = cardEls.current.get(id);
        const bgEl   = bgEls.current.get(id);
        if (cardEl) {
          cardEl.style.transition = 'none';
          cardEl.style.transform  = `translateX(${px}px)`;
        }
        if (bgEl) bgEl.style.opacity = String(Math.min(1, Math.abs(px) / threshold));
      },

      onTouchEnd: () => {
        if (!touchRef.current || touchRef.current.id !== id) return;
        const { isHorizontal, currentPx } = touchRef.current;
        touchRef.current = null;

        const cardEl = cardEls.current.get(id);
        const bgEl   = bgEls.current.get(id);
        const shouldDelete = isHorizontal && currentPx <= -threshold;

        if (!shouldDelete) {
          if (cardEl) {
            cardEl.style.transition = 'transform 0.22s ease-out';
            cardEl.style.transform  = 'translateX(0px)';
          }
          if (bgEl) bgEl.style.opacity = '0';
        }

        if (isHorizontal) {
          // The synthetic click fires before the next macrotask.
          // Keep isSwipingRef true so click handlers can guard against
          // accidental taps immediately after a swipe gesture completes.
          setTimeout(() => { isSwipingRef.current = false; }, 0);
        } else {
          isSwipingRef.current = false;
        }

        if (shouldDelete) onDelete(id);
      },
    };
  }

  return { bind, setCardEl, setBgEl, isSwipingRef };
}
