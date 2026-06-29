"use client";

import { useEffect, type RefObject } from "react";

// Closes a dropdown/menu when a click lands outside ALL of the given refs.
// Pass multiple refs when the same dropdown can be triggered from more than
// one place (e.g. a desktop and a mobile bell that render simultaneously,
// just CSS-hidden at different breakpoints) so closing one doesn't fight
// the other's "click" — only fires when the click is outside every ref.
export function useOutsideClick(
  refs: RefObject<HTMLElement | null>[],
  onOutside: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const isOutsideAll = refs.every(
        (ref) => !ref.current || !ref.current.contains(event.target as Node),
      );
      if (isOutsideAll) onOutside();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOutside, ...refs]);
}
