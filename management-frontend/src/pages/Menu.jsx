import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./Menu.css";

const CATEGORIES = ["All", "Burger", "Pizza", "Drink", "French fries", "Veggies"];

/* ─── Add Item Page ─── */
function AddItemPage({ onBack }) {
  const { addMenuItem } = useApp();
  const [form, setForm] = useState({
    name: "", description: "", price: "", averagePreparationTime: "",
    category: "Burger", stock: "",
  });
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPreviewImg(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert("Name and price required.");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current.files[0]) fd.append("image", fileRef.current.files[0]);
    await addMenuItem(fd);
    onBack();
  };

  return (
    <div className="add-item-page">
      <button className="add-item-back-btn" onClick={onBack}>×</button>
      <div className="add-item-content">
        {/* Left: Form */}
        <div className="add-item-form-side">
          {/* Image upload */}
          <div className="img-upload-box" onClick={() => fileRef.current.click()}>
            {previewImg ? (
              <img src={previewImg} alt="preview" className="img-preview" />
            ) : (
              <div className="img-placeholder">
                <img src="/icons/image.png" alt="upload" className="ico-lg" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />

          <div className="form-group">
            <label className="form-label">name</label>
            <input className="input" placeholder="name" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">description</label>
            <input className="input" placeholder="description" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">price</label>
            <input className="input" type="number" placeholder="price" value={form.price} onChange={e => set("price", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">average prep time</label>
            <input className="input" placeholder="time in minutes" value={form.averagePreparationTime} onChange={e => set("averagePreparationTime", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">category</label>
            <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">stock</label>
            <input className="input" type="number" placeholder="quantity" value={form.stock} onChange={e => set("stock", e.target.value)} />
          </div>

          <button className="btn btn-dark" style={{ marginTop: 8, padding: "14px 20px", display: "block", margin: "auto" }} onClick={handleSubmit}>
            Add New Dish
          </button>
        </div>

        {/* Right: Preview */}
        <div className="add-item-preview-side">
          <div className="menu-card preview-menu-card">
            <div className="menu-img-box">
              {previewImg
                ? <img src={previewImg} alt="preview" className="menu-img" />
                : <span className="menu-img-ph">Image</span>
              }
            </div>
            <div className="menu-info">
              <p>Name: {form.name || "—"}</p>
              <p>Description: {form.description || "—"}</p>
              <p>Price: {form.price ? `${form.price} ₹` : "—"}</p>
              <p>Average Prep Time: {form.averagePreparationTime ? `${form.averagePreparationTime} Mins` : "—"}</p>
              <p>Category: {form.category || "—"}</p>
              <p>InStock: {Number(form.stock) > 0 ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Menu Card ─── */
function MenuCard({ item, index, onDragStart, onDragOver, onDrop, isDragOver, filter, onDelete }) {
  const isMatch = filter && item.name.toLowerCase().includes(filter.toLowerCase());
  const blur = filter && !isMatch;

  return (
    <div
      className={`menu-card ${isDragOver ? "drag-over" : ""} ${blur ? "blurred" : ""} ${isMatch && filter ? "highlighted" : ""}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={() => onDrop(index)}
    >
      <div className="menu-img-box">
        {item.image
          ? <img src={`http://localhost:5000${item.image.startsWith('/') ? '' : '/'}${item.image}`} alt={item.name} className="menu-img" />
          : <span className="menu-img-ph">Image</span>
        }
      </div>
      <div className="menu-info">
        <p>Name: {item.name}</p>
        <p>Description: {item.description}</p>
        <p>Price: {item.price} ₹</p>
        <p>Average Prep Time: {item.averagePreparationTime} Mins</p>
        <p>Category: {item.category}</p>
        {item.stock !== undefined && <p>InStock: {item.stock > 0 ? "Yes" : "No"}</p>}
      </div>
      <button
        className="menu-card-delete"
        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${item.name}"?`)) onDelete(item._id); }}
        title="Delete item"
      >
        <img src="/icons/trash.png" alt="delete" className="ico-sm" />
      </button>
    </div>
  );
}

/* ─── Main Menu Page ─── */
export default function Menu({ filter }) {
  const { menuItems, reorderMenu, deleteMenuItem } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState("All");
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const filtered = category === "All"
    ? menuItems
    : menuItems.filter(m => m.category === category);

  const onDragStart = (i) => { dragFrom.current = i; };
  const onDragOver = (i) => setDragOver(i);
  const onDrop = (i) => {
    if (dragFrom.current === null || dragFrom.current === i) return;
    const globalFrom = menuItems.indexOf(filtered[dragFrom.current]);
    const globalTo = menuItems.indexOf(filtered[i]);
    reorderMenu(globalFrom, globalTo);
    dragFrom.current = null;
    setDragOver(null);
  };

  // ── Show Add Item as a full page ──
  if (showAdd) {
    return <AddItemPage onBack={() => setShowAdd(false)} />;
  }

  return (
    <div className="menu-page">
      {/* Category pills + Add button */}
      <div className="menu-cats">
        {CATEGORIES.map(c => (
          <button key={c} className={`pill ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
        <button className="btn btn-light menu-add-btn" onClick={() => setShowAdd(true)}>
          Add Item
        </button>
      </div>

      {/* Grid */}
      <div className="menu-grid">
        {filtered.map((item, i) => (
          <MenuCard
            key={item._id || item.id}
            item={item}
            index={i}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isDragOver={dragOver === i}
            filter={filter}
            onDelete={deleteMenuItem}
          />
        ))}
      </div>
    </div>
  );
}