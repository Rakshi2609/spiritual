"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import CartDrawer from "./CartDrawer";

/* ============================================================================
   App-wide UI context: the global cart drawer and the toast. Provided once
   around the whole app (in the root layout) so any page or the shared header
   can open the cart or fire a toast without owning that state itself.
   ============================================================================ */

type UICtx = {
  showToast: (text: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const UIContext = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <UIContext.Provider value={{ showToast, openCart, closeCart }}>
      {children}

      {/* global cart drawer */}
      <CartDrawer open={cartOpen} onClose={closeCart} onAdded={showToast} />

      {/* global toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 60, background: "#2F2820", color: "#F6EFE2", padding: "15px 26px", borderRadius: 3, fontSize: 14, letterSpacing: "0.5px", boxShadow: "0 14px 40px rgba(47,40,32,0.3)", animation: "toastIn 0.3s ease" }}>
          {toast}
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
