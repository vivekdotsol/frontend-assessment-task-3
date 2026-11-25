import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="logo">
        My Store
      </Link>

      <nav>
        <Link to="/">Products</Link>

        <Link to="/cart">Cart ({cartCount})</Link>
      </nav>
    </header>
  );
}
