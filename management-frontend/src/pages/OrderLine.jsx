import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./OrderLine.css";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Just now";
  return `${diff} min${diff > 1 ? "s" : ""} ago`;
}

function OrderCard({ order, onStatusChange }) {
  const isDone    = order.status === "done";
  const isPickup  = order.status === "not_picked";
  const isProcess = order.status === "processing";

  const cardClass  = isDone ? "card-done" : isPickup ? "card-pickup" : "card-process";
  const badgeClass = isDone ? "badge-done-green" : isPickup ? "badge-pickup" : "badge-process";
  const badgeText  = isDone
    ? "Done\nServed"
    : isPickup
    ? "Take Away\nNot Picked up"
    : order.type === "dine-in"
    ? `Dine In\nOngoing: ${Math.ceil((order.processingTime || 0) / 60)} Min`
    : `Take Away\nOngoing`;

  return (
    <div className={`order-card ${cardClass}`}>
      {/* Header */}
      <div className="oc-header">
        <div className="oc-left">
          <img src="/icons/fork.png" alt="order" className="ico" style={{opacity:0.6}} />
          <div>
            <p className="oc-id"># {order.orderId?.replace("ORD-","") || order._id?.slice(-4)}</p>
            <p className="oc-meta">{order.type === "dine-in" ? `Table-0${order.tableNumber}` : "Takeaway"}</p>
            <p className="oc-meta">{timeAgo(order.createdAt)}</p>
          </div>
        </div>
        <div className={`oc-badge ${badgeClass}`}>
          {badgeText.split("\n").map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>

      {/* Item count */}
      <p className="oc-item-count">{order.itemCount} Item</p>

      {/* Items list */}
      <div className="oc-items-box">
        {(order.items || []).map((item, i) => (
          <p key={i} className="oc-item">
            <span>{item.qty} x</span> {item.name}
          </p>
        ))}
      </div>

      {/* Footer — click to change status */}
      <div className="oc-footer">
        {isProcess ? (
          <button className="oc-processing-btn" onClick={() =>
            onStatusChange(order._id, order.type === "takeaway" ? "not_picked" : "done")
          }>
            <img src="/icons/hourglass.png" alt="processing" className="ico-sm" />
            Processing
          </button>
        ) : isDone ? (
          <div className="oc-done-btn done-green">
            <img src="/icons/check.png" alt="done" className="ico-sm" />
            Order Done
          </div>
        ) : (
          <button className="oc-done-btn done-gray" onClick={() => onStatusChange(order._id, "done")}>
            <img src="/icons/check.png" alt="done" className="ico-sm" />
            Order Done
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderLine() {
  const { orders, updateOrderStatus, fetchOrders } = useApp();

  // Poll for new orders every 10 seconds
  useEffect(() => {
    const t = setInterval(fetchOrders, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="orderline-page">
      <h2 className="section-title">Order Line</h2>
      <div className="orderline-grid">
        {orders.map(o => (
          <OrderCard key={o._id} order={o} onStatusChange={updateOrderStatus} />
        ))}
        {orders.length === 0 && <p style={{color:"var(--text2)"}}>No orders yet.</p>}
      </div>
    </div>
  );
}
