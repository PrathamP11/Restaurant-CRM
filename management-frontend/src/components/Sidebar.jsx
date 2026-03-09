import "./Sidebar.css";

const NAV = [
  { id: "analytics", icon: "dashboard" },
  { id: "tables",    icon: "table" },
  { id: "orders",    icon: "orders" },
  { id: "menu",      icon: "menu" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/icons/logo.png" alt="Logo" className="logo-icon" />
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            title={item.id}
          >
            <img src={`/icons/${item.icon}.png`} alt={item.id} className="nav-icon" />
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="admin-dot">
          <img src="/icons/admin-avatar.png" alt="Admin" className="admin-avatar" />
        </div>
      </div>
    </aside>

  );
}
