import { useEffect, useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./OrderLine.css";

function formatOrderTime(iso) {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  if (isToday) return time;
  return `${date.toLocaleDateString("en-US", { day: "numeric", month: "short" })} ${time}`;
}

function calcRemaining(order) {
  if (order.status !== "processing") return 0;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  return Math.max(0, (order.processingTime || 0) - elapsed);
}

function useCountdown(order, onStatusChange) {
  const remaining = calcRemaining(order);

  useEffect(() => {
    if (order.status === "processing" && remaining <= 0) {
      const nextStatus = order.type === "takeaway" ? "not_picked" : "done";
      onStatusChange(order._id, nextStatus);
    }
  }, [remaining, order.status]);

  return remaining;
}

function OrderCard({ order, onStatusChange }) {
  const remaining = useCountdown(order, onStatusChange);
  const isDone = order.status === "done";
  const isPickup = order.status === "not_picked";
  const isProcess = order.status === "processing";
  const isTakeawayProcess = isProcess && order.type === "takeaway";

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  const cardClass = isDone ? "card-done" : isPickup ? "card-takeaway" : isTakeawayProcess ? "card-takeaway" : "card-process";
  const badgeClass = isDone ? "badge-done-green" : isPickup ? "badge-takeaway" : isTakeawayProcess ? "badge-takeaway" : "badge-process";
  const badgeText = isDone
    ? order.type === "takeaway" ? "Done\nPicked Up" : "Done\nServed"
    : isPickup
      ? "Take Away\nNot Picked up"
      : order.type === "dine-in"
        ? `Dine In\nOngoing: ${timeStr}`
        : `Take Away\nOngoing: ${timeStr}`;

  return (
    <div className={`order-card ${cardClass}`}>
      {/* Header box */}
      <div className="oc-header-box">
        <div className="oc-header">
          <div className="oc-left">
            <img src="/icons/fork.png" alt="order" className="ico" style={{ opacity: 0.6 }} />
            <div>
              <p className="oc-id"># {order.orderId?.replace("ORD-", "") || order._id?.slice(-4)}</p>
              <p className="oc-meta">{order.type === "dine-in" && order.tableId ? `Table-${String(order.tableId.tableNumber).padStart(2, "0")}` : order.type === "dine-in" ? "Table (deleted)" : "Takeaway"}</p>
              <p className="oc-meta">{formatOrderTime(order.createdAt)}</p>
            </div>
          </div>
          <div className={`oc-badge ${badgeClass}`}>
            {badgeText.split("\n").map((l, i) => <span key={i} className={i === 1 ? "oc-badge-time" : ""}>{l}</span>)}
          </div>
        </div>
        <p className="oc-item-count">{order.itemCount} Item</p>
      </div>

      {/* Items list */}
      <div className="oc-items-box">
        {(order.items || []).map((item, i) => (
          <p key={i} className="oc-item">
            <span>{item.qty} x</span> {item.name}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="oc-footer">
        {isProcess ? (
          <div className={isTakeawayProcess ? "oc-takeaway-btn" : "oc-processing-btn"}>
            <img src={isTakeawayProcess ? "/icons/hourglass2.png" : "/icons/hourglass.png"} alt="processing" className="ico-sm" />
            Processing
          </div>
        ) : isDone ? (
          <div className="oc-done-btn done-green">
            <img src="/icons/check.png" alt="done" className="ico-sm" />
            Order Done
          </div>
        ) : (
          <button className="oc-done-btn done-gray" onClick={() => onStatusChange(order._id, "done")}>
            <img src="/icons/check2.png" alt="done" className="ico-sm" />
            Order Done
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderLine() {
  const { orders, updateOrderStatus, fetchOrders } = useApp();
  return (
    <>
      <h2 className="orderline-title">Order Line</h2>
      <div className="orderline-page">
        <div className="orderline-grid">
          {orders.map(o => (
            <OrderCard key={o._id} order={o} onStatusChange={updateOrderStatus} />
          ))}
          {orders.length === 0 && <p style={{ color: "var(--text2)" }}>No orders yet.</p>}
        </div>
      </div>
    </>
  );
}
