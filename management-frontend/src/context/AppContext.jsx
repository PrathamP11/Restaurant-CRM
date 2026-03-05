import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

const API = "http://localhost:5000/api";

export function AppProvider({ children }) {
  const [menuItems,     setMenuItems]     = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [chefs,         setChefs]         = useState([]);
  const [tables,        setTables]        = useState([]);
  const [analytics,     setAnalytics]     = useState({ totalRevenue: 0, totalOrders: 0, totalClients: 0 });
  const [loading,       setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  // Poll orders and tables every 5 seconds
  useEffect(() => {
    const t = setInterval(() => { fetchOrders(); fetchTables(); }, 5000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchChefs(), fetchTables(), fetchMenu(), fetchOrders(), fetchAnalytics("daily")]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChefs = async () => { const res = await axios.get(`${API}/chefs`); setChefs(res.data); };

  const fetchTables = async () => { const res = await axios.get(`${API}/tables`); setTables(res.data); };

  const addTable = async (name, chairs) => {
    try { await axios.post(`${API}/tables`, { name: name || "Table", chairs }); await fetchTables(); }
    catch (err) { alert(err.response?.data?.message || "Error adding table"); }
  };

  const deleteTable = async (id) => {
    try { await axios.delete(`${API}/tables/${id}`); await fetchTables(); }
    catch (err) { alert(err.response?.data?.message || "Error deleting table"); }
  };

  const fetchMenu = async () => { const res = await axios.get(`${API}/menu`); setMenuItems(res.data); };

  const addMenuItem = async (item) => {
    try { await axios.post(`${API}/menu`, item); await fetchMenu(); }
    catch (err) { alert(err.response?.data?.message || "Error adding item"); }
  };

  const deleteMenuItem = async (id) => {
    try { await axios.delete(`${API}/menu/${id}`); await fetchMenu(); }
    catch (err) { alert(err.response?.data?.message || "Error deleting item"); }
  };

  const reorderMenu = async (fromIndex, toIndex) => {
    const arr = [...menuItems];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    setMenuItems(arr);
    const payload = arr.map((item, i) => ({ id: item._id, order: i }));
    try { await axios.patch(`${API}/menu/reorder/bulk`, { items: payload }); }
    catch (err) { await fetchMenu(); }
  };

  const fetchOrders = async () => { const res = await axios.get(`${API}/orders`); setOrders(res.data); };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/orders/${id}/status`, { status });
      await fetchOrders();
      await fetchTables();
      await fetchAnalytics("daily");
    } catch (err) { alert(err.response?.data?.message || "Error updating order"); }
  };

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
      fetchAnalytics, fetchRevenue, fetchOrders, fetchTables,
      totalRevenue: analytics.totalRevenue,
      totalOrders:  analytics.totalOrders,
      totalClients: analytics.totalClients,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
