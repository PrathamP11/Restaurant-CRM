import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

/* ─── Cooking Instructions Modal ─── */
function CookingModal({ onClose, onSave }) {
  const [text, setText] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <h3 className="ci-title">Add Cooking instructions</h3>
        <div className="ci-textarea-wrap">
          <textarea className="ci-textarea" rows={5} value={text} onChange={e => setText(e.target.value)} />
        </div>
        <p className="ci-note">
          The restaurant will try its best to follow your request. However, refunds or cancellations in this regard won't be possible
        </p>
        <div className="ci-actions">
          <button className="btn-round btn-light-r ci-btn" onClick={onClose}>Cancel</button>
          <button className="btn-round btn-dark-r ci-btn" onClick={() => { onSave(text); onClose(); }}>Next</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Swipe to Order Button ─── */
function SwipeToOrder({ onSwipe, disabled }) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);
  const THRESHOLD = 220;

  const onStart = (clientX) => { isDragging.current = true; startX.current = clientX; };
  const onMove = (clientX) => {
    if (!isDragging.current || disabled) return;
    const dx = Math.max(0, Math.min(THRESHOLD, clientX - startX.current));
    setOffset(dx);
    if (dx >= THRESHOLD) { isDragging.current = false; setDone(true); onSwipe(); }
  };
  const onEnd = () => { if (!done) { isDragging.current = false; setOffset(0); } };

  return (
    <div
      className={`swipe-track ${done ? "swipe-done" : ""}`}
      onMouseMove={e => onMove(e.clientX)} onMouseUp={onEnd}
      onTouchMove={e => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
    >
      <div className="swipe-thumb" style={{ transform: `translateX(${offset}px)` }}
        onMouseDown={e => onStart(e.clientX)} onTouchStart={e => onStart(e.touches[0].clientX)}>
        <span className="swipe-arrow">{disabled ? "..." : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>}</span>
      </div>
      <span className="swipe-label" style={{ opacity: done ? 0 : 1 - offset / THRESHOLD * 0.8 }}>
        {disabled ? "Placing order..." : "Swipe to Order"}
      </span>
    </div>
  );
}

export default function Checkout({ onOrder, onBack }) {
  const { cartItems, cartTotal, user, setUser, removeItem, deleteItem, addItem, placeOrder, tables, fetchTables } = useCart();
  const [orderType, setOrderType] = useState("dine-in");
  const [showCI, setShowCI] = useState(false);
  const [instructions, setInst] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const deliveryTime = 40;

  useEffect(() => { fetchTables(); }, []);

  const handleSwipe = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await placeOrder({
        type: orderType,
        customerName: user?.name || "Guest",
        phone: user?.contact || "",
        address: user?.address || "",
        persons: user?.persons || 1,
        cookingInstructions: instructions,
      });
      onOrder();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order. Try again.";
      setErrorMsg(msg);
      setSubmitting(false);
      setTimeout(() => { setUser(null); onBack(); }, 3000);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  };

  return (
    <div className="screen checkout-screen">
      <div className="page-header">
        <p className="greeting-big">{getGreeting()}</p>
        <p className="greeting-sub">Place you order here</p>
      </div>

      <div className="search-bar search-disabled" style={{ marginBottom: "14px" }}>
        <img src="/icons/search.png" alt="search" className="ico-sm" />
        <input placeholder="Search" disabled />
      </div>


      <div className="checkout-body">
        {cartItems.map(({ item, qty }) => (
          <div key={item._id} className="cart-item">
            <div className="ci-img-wrap">
              {item.image ? <img src={`${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}${item.image.startsWith('/') ? '' : '/'}${item.image}`} alt={item.name} className="ci-img" /> : <div className="ci-img-ph" />}
            </div>
            <div className="ci-details">
              <p className="ci-name">{item.name}</p>
              <p className="ci-price">₹ {item.price}</p>
            </div>
            <div className="ci-qty-side">
              <button className="rm-btn" onClick={() => { deleteItem(item._id); if (cartItems.length <= 1) onBack(); }}><svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
              <div className="ci-qty-row">
                <button className="qty-btn-co" disabled={qty <= 1} style={qty <= 1 ? { opacity: 0.4 } : {}} onClick={() => qty > 1 && removeItem(item._id)}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
                <span className="qty-num-co">{qty}</span>
                <button className="qty-btn-co" onClick={() => addItem(item._id)}><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
              </div>
            </div>
          </div>
        ))}

        <button className="add-ci-link" onClick={() => setShowCI(true)}>
          Add cooking instructions (optional)
        </button>
        {instructions && <p className="ci-preview">"{instructions}"</p>}

        <div className="order-type-toggle">
          <button className={`ot-btn ${orderType === "dine-in" ? "active" : ""}`} onClick={() => setOrderType("dine-in")}>Dine In</button>
          <button className={`ot-btn ${orderType === "takeaway" ? "active" : ""}`} onClick={() => setOrderType("takeaway")}>Take Away</button>
        </div>

        <div className="bill-summary">
          <div className="bill-row"><span>Item Total</span><span>₹{cartTotal}.00</span></div>
          {orderType === "takeaway" && <div className="bill-row" ><span style={{ textDecoration: "underline dashed #817070", textUnderlineOffset: "5px" }}>Delivery Charge</span><span>₹50</span></div>}
          <div className="bill-row"><span>Taxes</span><span>₹{Math.round(cartTotal * 0.025)}.00</span></div>
          <div className="bill-row grand">
            <span>Grand Total</span>
            <span>₹{cartTotal + (orderType === "takeaway" ? 50 : 0) + Math.round(cartTotal * 0.025)}.00</span>
          </div>
        </div>

        <div className="your-details">
          <p className="yd-title">Your details</p>
          <p className="yd-info">{user?.name || "Guest"}, {user?.contact || "N/A"}</p>

          {orderType === "takeaway" && (
            <div style={{ borderBottom: "2px solid #e5e5e5", marginBottom: "10px" }}>
              <div className="yd-row-icon">
                <img src="/icons/location.png" alt="loc" className="ico-sm" />
                <span className="yd-address">Delivery at Home - {user?.address || "No address provided"}</span>
              </div>
              <div className="yd-row-icon">
                <img src="/icons/clock.png" alt="time" className="ico-sm" />
                <span className="yd-time">Delivery in <span style={{ fontWeight: "bold" }}>{deliveryTime} mins</span></span>
              </div>
            </div>
          )}
        </div>

        <div className="swipe-wrap">
          <SwipeToOrder onSwipe={handleSwipe} disabled={submitting} />
        </div>
      </div>

      {showCI && <CookingModal onClose={() => setShowCI(false)} onSave={(t) => { setInst(t); }} />}

      {errorMsg && (
        <div className="checkout-error-toast">
          <p>{errorMsg}</p>
          <p className="error-redirect">Redirecting to update details…</p>
          <div className="error-timer-bar" />
        </div>
      )}
    </div>
  );
}