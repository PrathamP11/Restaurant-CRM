import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import "./Thanks.css";

export default function Thanks({ onDone }) {
  const { clearCart } = useCart();
  const [count, setCount] = useState(5);

  useEffect(() => {
    clearCart();
    const t = setInterval(() => {
      setCount(p => {
        if (p <= 1) { clearInterval(t); onDone(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="thanks-screen">
      <div className="thanks-content">
        <h2 className="thanks-title">Thanks For Ordering</h2>
        <div className="thanks-check">
          <img src="/icons/check-white.png" alt="check" className="check-ico" />
        </div>
      </div>
      <p className="thanks-redirect">Redirecting in {count} sec</p>
    </div>
  );
}
