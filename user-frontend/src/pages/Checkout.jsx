import { useState, useRef } from "react";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

/* ─── Cooking Instructions Modal ─── */
function CookingModal({ onClose, onSave }) {
  const [text, setText] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
        <h3 className="ci-title">Add Cooking instructions</h3>
        <textarea className="ci-textarea" rows={5} value={text} onChange={e=>setText(e.target.value)} />
        <p className="ci-note">
          The restaurant will try its best to follow your request. However, refunds or cancellations in this regard won't be possible
        </p>
        <div className="ci-actions">
          <button className="btn-round btn-light-r ci-btn" onClick={onClose}>Cancel</button>
          <button className="btn-round btn-dark-r ci-btn" onClick={()=>{onSave(text);onClose();}}>Next</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Swipe to Order Button ─── */
function SwipeToOrder({ onSwipe, disabled }) {
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const [offset, setOffset] = useState(0);
  const [done,   setDone]   = useState(false);
  const THRESHOLD = 220;

  const onStart = (clientX) => { isDragging.current = true; startX.current = clientX; };
  const onMove  = (clientX) => {
    if (!isDragging.current || disabled) return;
    const dx = Math.max(0, Math.min(THRESHOLD, clientX - startX.current));
    setOffset(dx);
    if (dx >= THRESHOLD) { isDragging.current = false; setDone(true); onSwipe(); }
  };
  const onEnd = () => { if (!done) { isDragging.current = false; setOffset(0); } };

  return (
    <div
      className={`swipe-track ${done?"swipe-done":""}`}
      onMouseMove={e=>onMove(e.clientX)} onMouseUp={onEnd}
      onTouchMove={e=>onMove(e.touches[0].clientX)} onTouchEnd={onEnd}
    >
      <div className="swipe-thumb" style={{transform:`translateX(${offset}px)`}}
        onMouseDown={e=>onStart(e.clientX)} onTouchStart={e=>onStart(e.touches[0].clientX)}>
        <span className="swipe-arrow">{disabled ? "..." : "→"}</span>
      </div>
      <span className="swipe-label" style={{opacity: done ? 0 : 1 - offset/THRESHOLD*0.8}}>
        {disabled ? "Placing order..." : "Swipe to Order"}
      </span>
    </div>
  );
}

export default function Checkout({ onOrder, onBack }) {
  const { cartItems, cartTotal, user, removeItem, addItem, placeOrder, tables } = useCart();
  const [orderType,    setOrderType]   = useState("dine-in");
  const [showCI,       setShowCI]      = useState(false);
  const [instructions, setInst]        = useState("");
  const [submitting,   setSubmitting]  = useState(false);
  const [details, setDetails] = useState({
    name:    user?.name    || "",
    phone:   user?.contact || "",
    address: user?.address || "",
    persons: user?.persons || "",
  });
  const setD = (k, v) => setDetails(p => ({ ...p, [k]: v }));

  const availableTable = tables.find(t => !t.isReserved);
  const deliveryTime   = 42;

  const handleSwipe = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await placeOrder({
        type:                orderType,
        tableId:             orderType === "dine-in" ? availableTable?._id : null,
        customerName:        details.name,
        phone:               details.phone,
        address:             details.address,
        persons:             details.persons,
        cookingInstructions: instructions,
      });
      onOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="screen checkout-screen">
      <div className="page-header">
        <p className="greeting-big">Good evening</p>
        <p className="greeting-sub">Place you order here</p>
      </div>

      {/* Search (disabled on checkout) */}
      <div className="search-bar search-disabled">
        <img src="/icons/search.png" alt="search" className="ico-sm" />
        <input placeholder="Search" disabled />
        <img src="/icons/close.png" alt="close" className="ico-sm" />
      </div>

      <div className="checkout-body">
        {/* Cart items */}
        {cartItems.map(({item, qty}) => (
          <div key={item._id} className="cart-item">
            <div className="ci-img-wrap">
              {item.image ? <img src={item.image} alt={item.name} className="ci-img" /> : <div className="ci-img-ph" />}
            </div>
            <div className="ci-details">
              <p className="ci-name">{item.name}</p>
              <p className="ci-price">₹ {item.price}</p>
            </div>
            <div className="ci-qty-side">
              <button className="rm-btn" onClick={() => removeItem(item._id)}>
                <img src="/icons/close-red.png" alt="remove" className="ico-sm" />
              </button>
              <div className="ci-qty-row">
                <button className="qty-btn-co" onClick={() => removeItem(item._id)}>−</button>
                <span className="qty-num-co">{qty}</span>
                <button className="qty-btn-co" onClick={() => addItem(item._id)}>+</button>
              </div>
            </div>
          </div>
        ))}

        <button className="add-ci-link" onClick={() => setShowCI(true)}>
          Add cooking instructions (optional)
        </button>
        {instructions && <p className="ci-preview">"{instructions}"</p>}

        {/* Order type toggle */}
        <div className="order-type-toggle">
          <button className={`ot-btn ${orderType==="dine-in"?"active":""}`}   onClick={()=>setOrderType("dine-in")}>Dine In</button>
          <button className={`ot-btn ${orderType==="takeaway"?"active":""}`}  onClick={()=>setOrderType("takeaway")}>Take Away</button>
        </div>

        {/* Bill */}
        <div className="bill-summary">
          <div className="bill-row"><span>Item Total</span><span>₹{cartTotal}.00</span></div>
          {orderType==="takeaway" && <div className="bill-row"><span>Delivery Charge</span><span>₹50</span></div>}
          <div className="bill-row"><span>Taxes</span><span>₹{Math.round(cartTotal*0.025)}.00</span></div>
          <div className="bill-row grand">
            <span>Grand Total</span>
            <span>₹{cartTotal + (orderType==="takeaway"?50:0) + Math.round(cartTotal*0.025)}.00</span>
          </div>
        </div>

        {/* Details */}
        <div className="your-details">
          <p className="yd-title">Your details</p>
          <p className="yd-info">{details.name}, {details.phone}</p>

          {orderType === "dine-in" ? (
            <>
              <div className="yd-field"><label>Name</label><input className="yd-input" value={details.name} onChange={e=>setD("name",e.target.value)} /></div>
              <div className="yd-field"><label>Number of members</label><input className="yd-input" type="number" value={details.persons} onChange={e=>setD("persons",e.target.value)} /></div>
              <div className="yd-field"><label>Phone Number</label><input className="yd-input" value={details.phone} onChange={e=>setD("phone",e.target.value)} /></div>
            </>
          ) : (
            <>
              <div className="yd-row-icon">
                <img src="/icons/location.png" alt="loc" className="ico-sm" />
                <span className="yd-address">{details.address || "Add delivery address"}</span>
              </div>
              <div className="yd-row-icon">
                <img src="/icons/clock.png" alt="time" className="ico-sm" />
                <span className="yd-time">Delivery in {deliveryTime} mins</span>
              </div>
              <div className="yd-field"><label>Name</label><input className="yd-input" value={details.name} onChange={e=>setD("name",e.target.value)} /></div>
              <div className="yd-field"><label>Phone Number</label><input className="yd-input" value={details.phone} onChange={e=>setD("phone",e.target.value)} /></div>
              <div className="yd-field"><label>Complete Address</label><input className="yd-input" value={details.address} onChange={e=>setD("address",e.target.value)} /></div>
            </>
          )}
        </div>

        <div className="swipe-wrap">
          <SwipeToOrder onSwipe={handleSwipe} disabled={submitting} />
        </div>
      </div>

      {showCI && <CookingModal onClose={()=>setShowCI(false)} onSave={(t)=>{setInst(t);}} />}
    </div>
  );
}
