import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

const API = "http://localhost:5000/api";

export function AppProvider({ children }) {
  const [menuItems,  setMenuItems]  = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [chefs,      setChefs]      = useState([]);
  const [tables,     setTables]     = useState([]);
  const [analytics,  setAnalytics]  = useState({ totalRevenue: 0, totalOrders: 0, totalClients: 0 });
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetchAll();

    // Poll every 5 seconds — updates orders, tables, chefs, analytics live
    const t = setInterval(async () => {
      await fetchOrders();
      await fetchTables();
      await fetchChefs();
      await fetchAnalytics("daily");
    }, 5000);

    return () => clearInterval(t);
  }, []);

  // ── Called once on mount (tab reload) — completes expired orders first ──
  const fetchAll = async () => {
    setLoading(true);
    try {
      await fetchOrdersOnReload();   // completes expired orders in DB first
      await Promise.all([
        fetchChefs(),
        fetchTables(),               // now gets correct reserved status
        fetchMenu(),
        fetchAnalytics("daily"),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Chefs ────────────────────────────────────────────────
  const fetchChefs = async () => {
    const res = await axios.get(`${API}/chefs`);
    setChefs(res.data);
  };

  // ── Tables ───────────────────────────────────────────────
  const fetchTables = async () => {
    const res = await axios.get(`${API}/tables`);
    setTables(res.data);
  };

  const addTable = async (name, chairs) => {
    try {
      await axios.post(`${API}/tables`, { name: name || "Table", chairs });
      await fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding table");
    }
  };

  const deleteTable = async (id) => {
    try {
      await axios.delete(`${API}/tables/${id}`);
      await fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting table");
    }
  };

  // ── Menu ─────────────────────────────────────────────────
  const fetchMenu = async () => {
    const res = await axios.get(`${API}/menu`);
    setMenuItems(res.data);
  };

  const addMenuItem = async (formData) => {
    try {
      await axios.post(`${API}/menu`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding item");
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await axios.delete(`${API}/menu/${id}`);
      await fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting item");
    }
  };

  const reorderMenu = async (fromIndex, toIndex) => {
    const arr = [...menuItems];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    setMenuItems(arr);
    const payload = arr.map((item, i) => ({ id: item._id, order: i }));
    try {
      await axios.patch(`${API}/menu/reorder/bulk`, { items: payload });
    } catch (err) {
      await fetchMenu();
    }
  };

  // ── Orders ───────────────────────────────────────────────

  // Normal fetch — used by polling, no side effects on DB
  const fetchOrders = async () => {
    const res = await axios.get(`${API}/orders`);
    setOrders(res.data);
  };

  // Reload fetch — called only on page mount, completes all expired orders
  const fetchOrdersOnReload = async () => {
    const res = await axios.get(`${API}/orders?reload=true`);
    setOrders(res.data);
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/orders/${id}/status`, { status });
      await fetchOrders();
      await fetchTables();
      await fetchChefs();
      await fetchAnalytics("daily");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating order");
    }
  };

  // ── Analytics ────────────────────────────────────────────
  const fetchAnalytics = async (period = "daily") => {
    const res = await axios.get(`${API}/orders/analytics?period=${period}`);
    setAnalytics(res.data);
    return res.data;
  };

  const fetchRevenue = async (period = "weekly") => {
    const res = await axios.get(`${API}/orders/revenue?period=${period}`);
    return res.data;
  };

  return (
    <AppContext.Provider value={{
      menuItems, orders, chefs, tables, analytics, loading,
      addMenuItem, deleteMenuItem, reorderMenu,
      addTable, deleteTable,
      updateOrderStatus,
      fetchAnalytics, fetchRevenue, fetchOrders,
      totalRevenue:  analytics.totalRevenue,
      totalOrders:   analytics.totalOrders,
      totalClients:  analytics.totalClients,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
