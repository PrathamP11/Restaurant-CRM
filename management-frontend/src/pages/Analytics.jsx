import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./Analytics.css";

/* ─── Stat Card ─── */
function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap">
        <img src={`/icons/${icon}.png`} alt={label} className={`stat-icon ${icon === "rupee" ? "stat-icon-rupee" : ""}`} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

/* ─── Histogram Chart (SVG, real data) ─── */
function BarChart({ data, labels }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No revenue data yet</div>;
  }
  const H = 120, pad = 20;
  const values = data.map(d => d.revenue ?? d);
  const max = Math.max(...values) || 1;
  const count = values.length;
  const barGap = 2;
  const minBarWidth = 30;
  const minW = pad * 2 + count * minBarWidth + (count - 1) * barGap;
  const W = Math.max(340, minW);
  const barWidth = (W - pad * 2 - barGap * (count - 1)) / count;
  const chartH = H - pad * 2;

  const points = values.map((v, i) => ({
    x: pad + i * (barWidth + barGap) + barWidth / 2,
    y: pad + ((max - v) / max) * chartH,
  }));
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    const cp1y = points[i].y;
    const cp2x = cp1x;
    const cp2y = points[i + 1].y;
    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1].x},${points[i + 1].y}`;
  }

  return (
    <div className="chart-scroll-wrapper">
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart-svg" style={{ minWidth: W }}>
        <defs>
          <linearGradient id="barFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A1D27" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#1A1D27" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {values.map((v, i) => {
          const x = pad + i * (barWidth + barGap);
          const isMax = v === max;
          return (
            <rect key={i} x={x} y={pad} width={barWidth} height={chartH}
              fill={isMax ? "#1A1D27" : "url(#barFade)"} opacity={isMax ? 0.15 : 1} />
          );
        })}
        <path d={pathD} fill="none" stroke="#1A1D27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {labels && labels.map((l, i) => {
          const x = pad + i * (barWidth + barGap) + barWidth / 2;
          return <text key={i} x={x} y={H - 2} textAnchor="middle" fontSize="10" fill="#9CA3AF">{l}</text>;
        })}
      </svg>
    </div>
  );
}

/* ─── Donut Chart ─── */
function Donut({ served, dineIn, takeaway }) {
  const total = served + dineIn + takeaway || 1;
  const served_pct = Math.round((served / total) * 100);
  const dineIn_pct = Math.round((dineIn / total) * 100);
  const takeaway_pct = Math.round((takeaway / total) * 100);
  const R = 38, cx = 50, cy = 50, stroke = 14;
  const C = 2 * Math.PI * R;
  const segs = [
    { pct: served / total, color: "#5b5b5b" },
    { pct: dineIn / total, color: "#828282" },
    { pct: takeaway / total, color: "#2c2c2c" },
  ];
  const gapSize = 3;
  let offset = 0;
  const paths = segs.map((s, i) => {
    const dash = Math.max(s.pct * C - gapSize, 0);
    const gap = C - dash;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={R}
        fill="none" stroke={s.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset * C}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
      />
    );
    offset += s.pct;
    return el;
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="90" height="90">{paths}</svg>
      <div className="donut-legend">
        <div className="donut-row">
          <span>Served</span>
          <span className="donut-pct">({served_pct}%)</span>
          <div className="donut-bar-wrap"><div className="donut-bar" style={{ width: `${served_pct}%`, background: "#5b5b5b" }} /></div>
        </div>
        <div className="donut-row">
          <span>Dine In</span>
          <span className="donut-pct">({dineIn_pct}%)</span>
          <div className="donut-bar-wrap"><div className="donut-bar" style={{ width: `${dineIn_pct}%`, background: "#828282" }} /></div>
        </div>
        <div className="donut-row">
          <span>Take Away</span>
          <span className="donut-pct">({takeaway_pct}%)</span>
          <div className="donut-bar-wrap"><div className="donut-bar" style={{ width: `${takeaway_pct}%`, background: "#2c2c2c" }} /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tables Mini ─── */
function TablesMini({ tables, filter }) {
  const visible = filter
    ? tables.filter(t => String(t.tableNumber).padStart(2, "0").includes(filter))
    : tables;

  return (
    <div className="tables-mini">
      <div className="tables-mini-head">
        <h4 className="mini-title">Tables</h4>
        <div className="tables-legend">
          <span className="legend-dot green" /> <span>Reserved</span>
          <span className="legend-dot white" /> <span>Available</span>
        </div>
      </div>
      <div className="tables-mini-grid">
        {visible.map(t => (
          <div key={t._id} className={`mini-table ${t.isReserved ? "reserved" : "available"}`}>
            <span className="mini-table-label">{t.name || "Table"}</span>
            <span className="mini-table-num">{String(t.tableNumber).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Analytics ─── */
export default function Analytics({ filter }) {
  const { chefs, tables, totalRevenue, totalOrders, totalClients, fetchAnalytics, fetchRevenue, orders } = useApp();

  const [orderPeriod, setOrderPeriod] = useState("Daily");
  const [revPeriod, setRevPeriod] = useState("Daily");
  const [periodData, setPeriodData] = useState({ served: 0, dineIn: 0, takeaway: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [revLabels, setRevLabels] = useState([]);
  const [loadingRev, setLoadingRev] = useState(false);

  // Re-fetch order summary when period or orders change
  useEffect(() => {
    fetchAnalytics(orderPeriod.toLowerCase()).then(data => {
      setPeriodData({
        served: data.served ?? 0,
        dineIn: data.dineIn ?? 0,
        takeaway: data.takeaway ?? 0,
      });
    });
  }, [orderPeriod, orders]);

  // Re-fetch revenue when period changes
  useEffect(() => {
    setLoadingRev(true);
    fetchRevenue(revPeriod.toLowerCase()).then(data => {
      setRevenueData(data);
      setRevLabels(data.map(d => d.date));
    }).finally(() => setLoadingRev(false));
  }, [revPeriod]);

  const blurAll = filter.length > 0;
  const isBlurred = (keyword) =>
    blurAll && !keyword.toLowerCase().includes(filter.toLowerCase()) ? "blurred" : "";

  return (
    <div className="analytics-page">
      <h2 className="analytics-title">Analytics</h2>

      {/* Stat Cards */}
      <div className="stat-row">
        {[
          { icon: "chef", value: "04", label: "TOTAL CHEF" },
          { icon: "rupee", value: totalRevenue >= 1000 ? `₹${(totalRevenue / 1000).toFixed(0)}K` : `₹${totalRevenue}`, label: "TOTAL REVENUE" },
          { icon: "clipbrd", value: String(totalOrders).padStart(2, "0"), label: "TOTAL ORDERS" },
          { icon: "clients", value: String(totalClients).padStart(2, "0"), label: "TOTAL CLIENTS" },
        ].map((c, i) => (
          <div key={i} className={isBlurred(c.label)}>
            <StatCard {...c} />
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="middle-row">

        {/* Order Summary */}
        <div className={`card order-summary-card ${isBlurred("order summary")}`}>
          <div className="card-head">
            <span className="card-title">Order Summary</span>
            <div className="period-select-wrap">
              <select className="period-select" value={orderPeriod} onChange={e => setOrderPeriod(e.target.value)}>
                {["Daily", "Weekly", "Monthly"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="summary-nums">
            <div className="summary-num">
              <span className="sn-val">{String(periodData.served).padStart(2, "0")}</span>
              <span className="sn-lab">Served</span>
            </div>
            <div className="summary-num">
              <span className="sn-val">{String(periodData.dineIn).padStart(2, "0")}</span>
              <span className="sn-lab">Dine In</span>
            </div>
            <div className="summary-num">
              <span className="sn-val">{String(periodData.takeaway).padStart(2, "0")}</span>
              <span className="sn-lab">Take Away</span>
            </div>
          </div>
          <Donut served={periodData.served} dineIn={periodData.dineIn} takeaway={periodData.takeaway} />
        </div>

        {/* Revenue */}
        <div className={`card revenue-card ${isBlurred("revenue")}`}>
          <div className="card-head">
            <span className="card-title">Revenue</span>
            <div className="period-select-wrap">
              <select className="period-select" value={revPeriod} onChange={e => setRevPeriod(e.target.value)}>
                {["Daily", "Weekly", "Monthly", "Yearly"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {loadingRev
            ? <div className="chart-empty">Loading...</div>
            : <BarChart data={revenueData} labels={revLabels} />
          }
        </div>

        {/* Tables */}
        <div className={`card ${isBlurred("tables")}`}>
          <TablesMini tables={tables} filter={filter} />
        </div>
      </div>

      {/* Chef Table */}
      <div className="chef-table-card">
        <table className="chef-table">
          <thead>
            <tr>
              <th>Chef Name</th>
              <th>Order Taken</th>
            </tr>
          </thead>
          <tbody>
            {chefs.map(c => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{String(c.orders).padStart(2, "0")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
