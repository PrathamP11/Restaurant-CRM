import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

const API = "http://localhost:5000/api";

export const CATEGORIES = ["Burger", "Pizza", "Drink", "French fries", "Veggies"];

export function CartProvider({ children }) {
  const [menu,    setMenu]    = useState([]);
  const [tables,  setTables]  = useState([]);
  const [cart,    setCart]    = useState({});       // { itemId: qty }
  const [user,    setUser]    = useState(null);
  const [orderInstructions, setOrderInstructions] = useState("");
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    fetchMenu();
    fetchTables();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API}/menu`);
      setMenu(res.data);
    } catch (err) {
      console.error("Failed to fetch menu:", err.message);
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API}/tables`);
      setTables(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch tables:", err.message);
      return tables;
    }
  };

  const addItem    = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const removeItem = (id) => setCart(p => {
    if ((p[id] || 0) <= 1) { const n = { ...p }; delete n[id]; return n; }
    return { ...p, [id]: p[id] - 1 };
  });
  const deleteItem = (id) => setCart(p => { const n = { ...p }; delete n[id]; return n; });
  const clearCart  = () => setCart({});

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ item: menu.find(m => m._id === id), qty }))
    .filter(x => x.item);
  const cartTotal = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const cartCount = cartItems.reduce((s, { qty }) => s + qty, 0);

  // Place order — called from Checkout on swipe
  const placeOrder = async ({ type, customerName, phone, address, persons, cookingInstructions }) => {
    const items = cartItems.map(({ item, qty }) => ({
      menuItemId:             item._id,
      name:                   item.name,
      price:                  item.price,
      qty,
      averagePreparationTime: item.averagePreparationTime,
    }));

    const res = await axios.post(`${API}/orders`, {
      type, items, customerName, phone, address,
      persons: persons || 1,
      cookingInstructions: cookingInstructions || "",
    });

    return res.data;
  };

  return (
    <CartContext.Provider value={{
      menu, tables, loadingMenu,
      cart, cartItems, cartTotal, cartCount,
      addItem, removeItem, deleteItem, clearCart,
      user, setUser,
      orderInstructions, setOrderInstructions,
      placeOrder, fetchTables,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
