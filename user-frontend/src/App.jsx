import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Thanks from "./pages/Thanks";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");   // home | checkout | thanks

  return (
    <CartProvider>
      {page === "home"     && <Home     onNext={() => setPage("checkout")} />}
      {page === "checkout" && <Checkout onOrder={() => setPage("thanks")} onBack={() => setPage("home")} />}
      {page === "thanks"   && <Thanks   onDone={() => setPage("home")} />}
    </CartProvider>
  );
}
