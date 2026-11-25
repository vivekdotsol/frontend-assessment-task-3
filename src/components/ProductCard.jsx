import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <img src={product.thumbnail} alt={product.title} />

      <h3>{product.title}</h3>

      <p>${product.price.toFixed(2)}</p>

      <button onClick={() => addToCart(product)}>Add to cart</button>
    </div>
  );
}
