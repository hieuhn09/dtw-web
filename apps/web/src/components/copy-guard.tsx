"use client";

import { useEffect } from "react";

/**
 * Copy protection for reader pages: blocks copy/cut, the right-click menu,
 * dragging text or images out, and starting a text selection. Pairs with the
 * `user-select: none` rules at the end of globals.css, which also stop the
 * long-press copy/save callout on phones.
 *
 * Form fields are exempt, so readers can still type, select, copy and paste in
 * the search, sign-in and newsletter inputs. The share bar's "copy link" button
 * keeps working: navigator.clipboard.writeText() fires no copy event.
 *
 * Renders nothing. A deterrent, not DRM: view-source, reader mode or turning
 * JavaScript off still expose the text.
 */
const BLOCKED_EVENTS = ["copy", "cut", "contextmenu", "dragstart", "selectstart"] as const;

const EDITABLE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

function isEditable(target: EventTarget | null): boolean {
  // selectstart can fire on a Text node, which has no closest(): use its parent.
  const el =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  return el?.closest(EDITABLE) != null;
}

function block(event: Event) {
  if (!isEditable(event.target)) event.preventDefault();
}

export function CopyGuard() {
  useEffect(() => {
    for (const type of BLOCKED_EVENTS) document.addEventListener(type, block);
    return () => {
      for (const type of BLOCKED_EVENTS) document.removeEventListener(type, block);
    };
  }, []);
  return null;
}
