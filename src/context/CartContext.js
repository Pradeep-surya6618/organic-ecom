import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find(item => item.id === product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      return { ...state, items: [...state.items, { ...product, quantity }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter(item => item.quantity > 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SAVE_ORDER': {
      const newOrder = {
        id: `ORD-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        total: action.payload.total,
        items: action.payload.items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
        })),
      };
      const orders = [...state.orders, newOrder];
      localStorage.setItem('orders', JSON.stringify(orders));
      return { ...state, orders, items: [] };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: (() => {
      try { return JSON.parse(localStorage.getItem('cart')) || []; }
      catch { return []; }
    })(),
    orders: (() => {
      try { return JSON.parse(localStorage.getItem('orders')) || []; }
      catch { return []; }
    })(),
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const placeOrder = (total) => {
    dispatch({ type: 'SAVE_ORDER', payload: { items: state.items, total } });
  };

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Canonical pricing — must match backend order.service so the charged amount,
  // the recorded order total, and the invoice all agree.
  const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <CartContext.Provider value={{
      cart: state.items,
      items: state.items,
      orders: state.orders,
      addToCart,
      addItem: addToCart,
      removeFromCart,
      removeItem: removeFromCart,
      updateQuantity,
      clearCart,
      placeOrder,
      totalItems,
      totalPrice: subtotal,
      subtotal,
      shipping,
      tax,
      total,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};