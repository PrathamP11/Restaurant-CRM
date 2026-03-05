import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./Tables.css";

export default function Tables() {
  const { tables, addTable, deleteTable } = useApp();
  const [showPopup, setShowPopup] = useState(false);
  const [popupName, setPopupName] = useState("");
  const [popupChairs, setPopupChairs] = useState("03");
  const popupRef = useRef(null);

  useEffect(() => {
    if (!showPopup) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPopup]);

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
      <h2 className="tables-title">Tables</h2>

      <div className="tables-grid">
        {tables.map((t) => (
          <div key={t._id} className={`table-card ${t.isReserved ? "reserved" : ""}`}>
            <button
              className="table-delete"
              onClick={() => handleDelete(t._id, t.isReserved)}
              title={t.isReserved ? "Cannot delete reserved table" : "Delete table"}
            >
              <img src="/icons/trash.png" alt="delete" className="trash-icon" />
            </button>
            <span className="table-label">{t.name || "Table"}</span>
            <span className="table-num">{String(t.tableNumber).padStart(2, "0")}</span>
            <div className="table-chairs">
              <img src="/icons/chair.png" alt="chairs" className="chair-icon" />
              <span>{String(t.chairs).padStart(2,"0")}</span>
            </div>
          </div>
        ))}

        {/* Add button */}
        {tables.length < 30 && (
          <div className="add-table-wrap" ref={popupRef}>
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
                    {["01","02","03","04","05","06","07","08"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <button className="popup-create" onClick={handleAdd}>Create</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
