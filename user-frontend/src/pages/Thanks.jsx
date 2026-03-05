import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import "./Thanks.css";

export default function Thanks({ onDone }) {
  const { clearCart, setUser } = useCart();
  const [count, setCount] = useState(5);

  useEffect(() => {
    clearCart();
    const t = setInterval(() => {
      setCount(p => {
        if (p <= 1) { clearInterval(t); setUser(null); onDone(); return 0; }
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
          <svg className="check-ico" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <p className="thanks-redirect">Redirecting in {count} sec</p>
    </div>
  );
}
