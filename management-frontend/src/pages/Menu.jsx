import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./Menu.css";

const CATEGORIES = ["All", "Burgers", "Pizza", "Drinks", "Snacks", "Mains"];

/* ─── Add Item Page ─── */
function AddItemPage({ onBack }) {
  const { addMenuItem } = useApp();
  const [form, setForm] = useState({
    name: "", description: "", price: "", averagePreparationTime: "",
    category: "Burgers", stock: "",
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
    await addMenuItem({
      ...form,
      price: Number(form.price),
      averagePreparationTime: Number(form.averagePreparationTime),
      stock: Number(form.stock),
      image: previewImg,
    });
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

        <div className="preview-card">
          <div className="preview-img-row">
            {previewImg
              ? <img src={previewImg} alt="preview" className="preview-thumb" />
              : <div className="preview-thumb-ph"><img src="/icons/image1.png" alt="" className="ico" /></div>
            }
            <div>
              <p className="preview-title">{form.name || "Title"}</p>
              <p className="preview-desc">{form.description || "Description"}</p>
            </div>
          </div>
          <div className="preview-details">
            <p>Price: {form.price ? ` ${form.price} ₹` : "—"}</p>
            <p>Prep Time: {form.averagePreparationTime ? `${form.averagePreparationTime} Mins` : "—"}</p>
            <p>Category: {form.category}</p>
            <p>{Number(form.stock) > 0 ? "InStock: Yes" : "InStock: No"}</p>
          </div>
        </div>

        <div className="preview-delete-bar" />
      </div>
      </div>
    </div>
  );
}

/* ─── Menu Card ─── */
function MenuCard({ item, index, onDragStart, onDragOver, onDrop, isDragOver, filter }) {
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
          ? <img src={item.image} alt={item.name} className="menu-img" />
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
    </div>
  );
}

/* ─── Main Menu Page ─── */
export default function Menu({ filter }) {
  const { menuItems, reorderMenu } = useApp();
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
    reorderMenu(dragFrom.current, i);
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
          />
        ))}
      </div>
    </div>
  );
}
