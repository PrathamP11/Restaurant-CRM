import { useState, useRef, useEffect, useCallback } from "react";
import { useCart, CATEGORIES } from "../context/CartContext";
import "./Home.css";

/* ─── Login Modal ─── */
function LoginModal({ onSubmit }) {
  const [form, setForm] = useState({ name:"", persons:"", address:"", contact:"" });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = () => {
    if (!form.name || !form.contact) return alert("Name and contact are required.");
    onSubmit(form);
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <h3 className="login-title">Enter Your Details</h3>
        <div className="lm-field">
          <label>Name</label>
          <input className="lm-input" placeholder="full name" value={form.name} onChange={e=>set("name",e.target.value)} />
        </div>
        <div className="lm-field">
          <label>Number of Person</label>
          <input className="lm-input active" placeholder="1-4" type="number" value={form.persons} onChange={e=>set("persons",e.target.value)} />
        </div>
        <div className="lm-field">
          <label>Address</label>
          <input className="lm-input" placeholder="address" value={form.address} onChange={e=>set("address",e.target.value)} />
        </div>
        <div className="lm-field">
          <label>Contact</label>
          <input className="lm-input" placeholder="phone" value={form.contact} onChange={e=>set("contact",e.target.value)} />
        </div>
        <button className="btn-round btn-dark-r login-btn" onClick={handleSubmit}>
          Order Now
        </button>
      </div>
    </div>
  );
}

/* ─── Category pill ─── */
function CategoryPill({ cat, active, onClick }) {
  const iconMap = {
    "All":"all", "Burger":"burger", "Pizza":"pizza",
    "Drink":"drink", "French fries":"fries", "Veggies":"veggies"
  };
  return (
    <button className={`cat-pill ${active?"active":""}`} onClick={onClick}>
      <div className="cat-icon-wrap">
        <img src={`/icons/${iconMap[cat]||"all"}.png`} alt={cat} className="ico" />
      </div>
      <span>{cat}</span>
    </button>
  );
}

/* ─── Food Item Card ─── */
function ItemCard({ item }) {
  const { cart, addItem, removeItem } = useCart();
  const qty = cart[item._id] || 0;
  return (
    <div className="item-card">
      <div className="item-img-box">
        {item.image
          ? <img src={item.image} alt={item.name} className="item-img" />
          : <div className="item-img-ph" />
        }
      </div>
      <div className="item-footer">
        <p className="item-name">{item.name}</p>
        <p className="item-price">₹ {item.price}</p>
        {qty === 0 ? (
          <button className="item-add-btn" onClick={() => addItem(item._id)}>
            <span>+</span>
          </button>
        ) : (
          <div className="item-qty-row">
            <button className="qty-btn" onClick={() => removeItem(item._id)}>−</button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => addItem(item._id)}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 6;

export default function Home({ onNext }) {
  const { user, setUser, cartCount, menu, loadingMenu } = useCart();
  const [category,  setCategory]    = useState("All");
  const [search,    setSearch]      = useState("");
  const [visibleN,  setVisibleN]    = useState(PAGE_SIZE);
  const loaderRef = useRef();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  // Filter items (search crosses all categories)
  const filtered = menu.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || m.category === category;
    return search ? matchSearch : matchCat && matchSearch;
  });

  const visible = filtered.slice(0, visibleN);
  const hasMore = visibleN < filtered.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore) setVisibleN(p => p + PAGE_SIZE);
    }, { threshold: 0.5 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  // Reset visible on filter change
  useEffect(() => { setVisibleN(PAGE_SIZE); }, [category, search]);

  const catTitle = category === "All" ? (search ? "Results" : "All Items") : category;

  return (
    <div className="screen home-screen">
      {/* Header */}
      <div className="page-header">
        <p className="greeting-big">{getGreeting()}</p>
        <p className="greeting-sub">Place you order here</p>
      </div>

      {/* Search */}
      <div className={`search-bar ${!user?"blurred-search":""}`}>
        <img src="/icons/search.png" alt="search" className="ico-sm" />
        <input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          readOnly={!user}
        />
      </div>

      {/* Categories (horizontal scroll) */}
      <div className="cats-row">
        {CATEGORIES.map(c => (
          <CategoryPill key={c} cat={c} active={category===c} onClick={() => setCategory(c)} />
        ))}
      </div>

      {/* Section title */}
      <div className="home-items-wrap">
        <h3 className="home-section-title">{catTitle}</h3>
        <div className="items-grid">
          {visible.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
        {hasMore && <div ref={loaderRef} className="load-more-trigger" />}
      </div>

      {/* Next button */}
      {cartCount > 0 && (
        <div className="next-bar">
          <button className="btn-round btn-dark-r next-btn" onClick={onNext}>
            Next
          </button>
        </div>
      )}

      {/* Login modal (shown first) */}
      {!user && <LoginModal onSubmit={setUser} />}
    </div>
  );
}
