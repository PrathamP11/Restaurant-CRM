import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Analytics from "./pages/Analytics";
import Tables from "./pages/Tables";
import OrderLine from "./pages/OrderLine";
import Menu from "./pages/Menu";
import "./App.css";

export default function App() {
  const [page, setPage]     = useState("analytics");
  const [filter, setFilter] = useState("");

  const renderPage = () => {
    switch (page) {
      case "analytics": return <Analytics filter={filter} />;
      case "tables":    return <Tables />;
      case "orders":    return <OrderLine />;
      case "menu":      return <Menu filter={filter} />;
      default:          return <Analytics filter={filter} />;
    }
  };

  return (
    <AppProvider>
      <div className="app-shell">
        <Sidebar activePage={page} onNavigate={setPage} />
        <div className="main-area">
          {page !== "tables" && page !== "orders" && (
            <div className="top-bar">
              <div className="filter-wrap">
                <input
                  className="filter-input"
                  placeholder="Filter..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />

              </div>
            </div>
          )}
          <main className="page-content">{renderPage()}</main>
        </div>
      </div>
    </AppProvider>
  );
}
