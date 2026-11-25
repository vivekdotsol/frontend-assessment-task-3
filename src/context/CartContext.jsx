import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("cart");

    if (!savedCart) {
      return { items: [], notice: "" };
    }

    const parsedCart = JSON.parse(savedCart);

    if (
      !Array.isArray(parsedCart) ||
      !parsedCart.every(
        (item) =>
          item &&
          Number.isInteger(item.id) &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1 &&
          item.quantity <= 10,
      )
    ) {
      throw new Error("Invalid cart");
    }

    return { items: parsedCart, notice: "" };
  } catch {
    try {
      localStorage.removeItem("cart");
    } catch {}

    return {
      items: [],
      notice: "Your saved cart was invalid and has been reset.",
    };
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getSavedCart().items);
  const [notice, setNotice] = useState(() => getSavedCart().notice);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {
      setNotice("Could not save your cart in this browser.");
    }
  }, [items]);

  function addToCart(product) {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);

      if (existing) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function updateQuantity(id, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const discount = subtotal > 100 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    return { subtotal, discount, total };
  }, [items]);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      notice,
      setNotice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totals,
      cartCount,
    }),
    [items, notice, totals, cartCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
