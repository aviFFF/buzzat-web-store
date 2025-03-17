export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

/**
 * Get cart items from localStorage
 */
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
  }
  
  return [];
};

/**
 * Save cart items to localStorage
 */
export const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify(items));
    // We don't dispatch the event here anymore since specific functions will do it
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = (item: CartItem): void => {
  const currentCart = getCartItems();
  
  // Check if item already exists in cart
  const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    currentCart[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item
    currentCart.push(item);
  }
  
  saveCartItems(currentCart);
  
  // Dispatch custom event with product details
  window.dispatchEvent(new CustomEvent('cart-updated', { 
    detail: { 
      action: 'add',
      product: {
        id: item.id,
        name: item.name,
        price: item.price
      }
    } 
  }));
};

/**
 * Update item quantity in cart
 */
export const updateCartItemQuantity = (id: number, quantity: number): void => {
  const currentCart = getCartItems();
  
  if (quantity < 1) {
    // Remove item if quantity is less than 1
    const updatedCart = currentCart.filter(item => item.id !== id);
    saveCartItems(updatedCart);
    
    // Dispatch custom event for removal
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { 
        action: 'remove',
        product: { id }
      }
    }));
  } else {
    // Update quantity
    const updatedCart = currentCart.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    saveCartItems(updatedCart);
    
    // Find the updated item to include in the event
    const updatedItem = updatedCart.find(item => item.id === id);
    
    // Dispatch custom event for update
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { 
        action: 'update',
        product: updatedItem
      }
    }));
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = (id: number): void => {
  const currentCart = getCartItems();
  const updatedCart = currentCart.filter(item => item.id !== id);
  saveCartItems(updatedCart);
  
  // Dispatch custom event for removal
  window.dispatchEvent(new CustomEvent('cart-updated', { 
    detail: { 
      action: 'remove',
      product: { id }
    }
  }));
};

/**
 * Clear cart
 */
export const clearCart = (): void => {
  saveCartItems([]);
  
  // Dispatch custom event for clearing cart
  window.dispatchEvent(new CustomEvent('cart-updated', { 
    detail: { 
      action: 'clear'
    }
  }));
};

/**
 * Calculate cart totals
 */
export const getCartTotals = () => {
  const items = getCartItems();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    totalItems,
    subtotal,
    deliveryFee: 40, // Fixed delivery fee
    total: subtotal + 40
  };
}; 