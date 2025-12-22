"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from "next/navigation"; 

export interface CartItem {
  id: number;
  internalId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  selectedVariant?: string; 
  selectedModifiers?: { [key: string]: string }; 
  note?: string; 
}

export interface BookingInfo {
  seatId: string | null;
  date: string;
  time: string;
}

interface CartContextType {
  cartItems: CartItem[];
  bookingInfo: BookingInfo;
  isCartOpen: boolean;
  totalItems: number;
  cartTotal: number;
  
  // 👇 TAMBAHAN BIAR NAVBAR GAK ERROR
  cartCount: number; 

  setBookingInfo: (info: BookingInfo) => void;
  toggleCart: () => void;
  addToCart: (product: Omit<CartItem, 'internalId'>) => void;
  removeFromCart: (internalId: string) => void;
  updateQuantity: (internalId: string, type: 'plus' | 'minus') => void;
  clearCart: () => void;
  
  // --- UPDATE: Fungsi Checkout menerima parameter ---
  processCheckout: (type: 'dine_in' | 'take_away', seatId?: string | null) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    seatId: null,
    date: new Date().toLocaleDateString(),
    time: "Now",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("getcha_cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("getcha_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product: Omit<CartItem, 'internalId'>) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => 
        item.id === product.id && 
        item.selectedVariant === product.selectedVariant &&
        JSON.stringify(item.selectedModifiers) === JSON.stringify(product.selectedModifiers)
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += product.quantity || 1; 
        return newCart;
      }

      const uniqueId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return [...prev, { ...product, internalId: uniqueId, quantity: product.quantity || 1 }];
    });
    setIsCartOpen(true); // Buka sidebar saat add
  };

  const removeFromCart = (internalId: string) => {
    setCartItems((prev) => prev.filter((item) => item.internalId !== internalId));
  };

  const updateQuantity = (internalId: string, type: 'plus' | 'minus') => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.internalId === internalId) {
          const newQty = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setBookingInfo({ seatId: null, date: "", time: "" });
  };

  // --- UPDATE: LOGIC CHECKOUT KE BACKEND ---
  const processCheckout = async (type: 'dine_in' | 'take_away', seatId: string | null = null) => {
    if (cartItems.length === 0) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        // Kirim detail lengkap ke Backend
        body: JSON.stringify({ 
            items: cartItems,
            type: type,      // 'dine_in' atau 'take_away'
            seat_id: seatId  // null jika take away
        }), 
      });

      const result = await response.json();

      if (result.success) {
        setIsCartOpen(false);
        clearCart();
        // Arahkan ke halaman Sukses
        router.push(`/success?order_id=${result.order_id}`);
      } else {
        alert("Gagal Checkout: " + result.message);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // 👇 INI YANG BIKIN ERROR HILANG
  // cartCount hanyalah alias untuk totalItems
  const cartCount = totalItems; 

  return (
    <CartContext.Provider value={{ 
      cartItems, bookingInfo, isCartOpen, totalItems, cartTotal, cartCount, // 👈 Masukkan cartCount disini
      setBookingInfo, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, processCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};