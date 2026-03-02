import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Tables.css";

export default function Tables() {
  const { tables, addTable, deleteTable } = useApp();
  const [showPopup, setShowPopup] = useState(false);
  const [popupName, setPopupName] = useState("");
  const [popupChairs, setPopupChairs] = useState("03");

  const handleAdd = () => {
    if (tables.length >= 30) return alert("Maximum 30 tables allowed.");
    addTable(popupName, parseInt(popupChairs));
    setPopupName(""); setPopupChairs("03"); setShowPopup(false);
  };

  const handleDelete = (id, reserved) => {
    if (reserved) return alert("Reserved tables cannot be deleted.");
    deleteTable(id);
  };

  return (
    <div className="tables-page">
      <h2 className="section-title">Tables</h2>

      <div className="tables-grid">
        {tables.map((t) => (
          <div key={t.id} className={`table-card ${t.reserved ? "reserved" : ""}`}>
            <button
              className="table-delete"
              onClick={() => handleDelete(t.id, t.reserved)}
              title={t.reserved ? "Cannot delete reserved table" : "Delete table"}
            >
              <img src="/icons/trash.png" alt="delete" className="ico-sm" />
            </button>
            <span className="table-label">{t.name || "Table"}</span>
            <span className="table-num">{String(t.no).padStart(2, "0")}</span>
            <div className="table-chairs">
              <img src="/icons/chair.png" alt="chairs" className="ico-sm" />
              <span>{String(t.chairs).padStart(2,"0")}</span>
            </div>
          </div>
        ))}

        {/* Add button */}
        {tables.length < 30 && (
          <div className="add-table-wrap">
            <button className="add-table-btn" onClick={() => setShowPopup(v => !v)}>
              <span className="add-plus">+</span>
            </button>

            {showPopup && (
              <div className="add-popup">
                <p className="popup-label">Table name (optional)</p>
                <input
                  className="popup-input"
                  placeholder={String(tables.length + 1)}
                  value={popupName}
                  onChange={e => setPopupName(e.target.value)}
                />
                <p className="popup-label">Chair</p>
                <div className="popup-select-wrap">
                  <select className="popup-select" value={popupChairs} onChange={e => setPopupChairs(e.target.value)}>
                    {["02","03","04","06","08"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <button className="btn btn-dark popup-create" onClick={handleAdd}>Create</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
