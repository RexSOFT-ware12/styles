"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number | string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        // Corrupted or incompatible-shape value (e.g. manually edited, or
        // left over from an older version of the app) — start fresh rather
        // than letting JSON.parse throw and break the whole app.
        setCart([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // avoid clobbering saved data before it's loaded
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  // Each product is a unique digital download — no point "buying" the same
  // one twice, so adding it again while it's already in the cart is a no-op.
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const alreadyInCart = prevCart.some((cartItem) => cartItem.id === item.id);
      if (alreadyInCart) return prevCart;
      return [...prevCart, item];
    });
  };

  const removeFromCart = (id: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
