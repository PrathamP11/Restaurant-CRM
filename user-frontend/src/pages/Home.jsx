import { useState, useRef, useEffect } from "react";
import { useCart, CATEGORIES } from "../context/CartContext";
import "./Home.css";

/* ─── Login Modal ─── */
function LoginModal({ onSubmit }) {
  const [form, setForm] = useState({ name: "", persons: "", address: "", contact: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    const persons = Number(form.persons);
    if (!form.persons) errs.persons = "Number of persons is required.";
    else if (!Number.isInteger(persons) || persons < 1 || persons > 8) errs.persons = "Must be between 1 and 8.";
    if (!form.address.trim()) errs.address = "Address is required.";
    else if (!/^[a-zA-Z0-9\s,.\-/#]+$/.test(form.address.trim())) errs.address = "Invalid address format.";
    if (!form.contact) errs.contact = "Contact is required.";
    else if (!/^\d{10}$/.test(form.contact)) errs.contact = "Must be exactly 10 digits.";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(form);
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <h3 className="login-title">Enter Your Details</h3>
        <div className="lm-field">
          <label>Name</label>
          <input className={`lm-input${errors.name ? " lm-input-error" : ""}`} placeholder="full name" value={form.name} onChange={e => set("name", e.target.value)} />
          {errors.name && <span className="lm-error">{errors.name}</span>}
        </div>
        <div className="lm-field">
          <label>Number of Person</label>
          <input className={`lm-input active${errors.persons ? " lm-input-error" : ""}`} placeholder="1-8" type="number" min="1" max="8" value={form.persons} onChange={e => set("persons", e.target.value)} />
          {errors.persons && <span className="lm-error">{errors.persons}</span>}
        </div>
        <div className="lm-field">
          <label>Address</label>
          <input className={`lm-input${errors.address ? " lm-input-error" : ""}`} placeholder="address" value={form.address} onChange={e => set("address", e.target.value)} />
          {errors.address && <span className="lm-error">{errors.address}</span>}
        </div>
        <div className="lm-field">
          <label>Contact</label>
          <input className={`lm-input${errors.contact ? " lm-input-error" : ""}`} placeholder="10-digit phone number" value={form.contact} onChange={e => set("contact", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          {errors.contact && <span className="lm-error">{errors.contact}</span>}
        </div>
        <button className="btn-round login-btn" onClick={handleSubmit}>
          Order Now
        </button>
      </div>
    </div>
  );
}

/* ─── Category pill ─── */
function CategoryPill({ cat, active, onClick }) {
  const iconMap = {
    "Burger": "burger", "Pizza": "pizza",
    "Drink": "drink", "French fries": "fries", "Veggies": "veggies"
  };
  return (
    <button className={`cat-pill ${active ? "active" : ""}`} onClick={onClick}>
      <div className="cat-icon-wrap">
        <img src={`/icons/${iconMap[cat] || "all"}.png`} alt={cat} className="ico" />
        <span className="cat-label">{cat}</span>
      </div>
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
          ? <img src={`http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`} alt={item.name} className="item-img" />
          : <div className="item-img-ph" />
        }
      </div>
      <div className="item-footer">
        <p className="item-name">{item.name}</p>
        <p className="item-price">₹ {item.price}</p>
        {qty === 0 ? (
          <button className="item-add-btn" onClick={() => addItem(item._id)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        ) : (
          <div className="item-qty-row">
            <button className="qty-btn" onClick={() => removeItem(item._id)}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            <span className="qty-num">{qty}</span>
            <button className="qty-btn" onClick={() => addItem(item._id)}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 6;

export default function Home({ onNext }) {
  const { user, setUser, cartCount, menu, loadingMenu } = useCart();
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [visibleN, setVisibleN] = useState(PAGE_SIZE);
  const loaderRef = useRef();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    if (h < 24) return "Good evening";
    return "Good night";
  };

  // Filter items (search crosses all categories)
  const filtered = menu.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || m.category === category;
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

  const catTitle = !category ? (search ? "Results" : "All Items") : category;

  return (
    <div className="screen home-screen">
      {/* Header */}
      <div className="page-header">
        <p className="greeting-big">{getGreeting()}</p>
        <p className="greeting-sub">Place you order here</p>
      </div>

      {/* Search */}
      <div className={`search-bar ${!user ? "blurred-search" : ""}`}>
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
          <CategoryPill key={c} cat={c} active={category === c} onClick={() => setCategory(category === c ? null : c)} />
        ))}
      </div>

      {/* Section title */}
      <div className="home-items-wrap">
        <h3 className="home-section-title">{catTitle}</h3>
        <div className="items-grid">
          {visible.map(item => <ItemCard key={item._id} item={item} />)}
        </div>
        {hasMore && <div ref={loaderRef} className="load-more-trigger" />}
      </div>

      {/* Next button */}
      {cartCount > 0 && (
        <div className="next-bar">
          <button className="btn-round next-btn" onClick={onNext}>
            Next
          </button>
        </div>
      )}

      {/* Login modal (shown first) */}
      {!user && <LoginModal onSubmit={setUser} />}
    </div>
  );
}
