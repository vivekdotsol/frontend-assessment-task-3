import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function getProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=12",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Could not load products");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to load products. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    getProducts();

    return () => controller.abort();
  }, [retry]);

  if (loading) {
    return <p className="message">Loading products...</p>;
  }

  if (error) {
    return (
      <div className="message">
        <p>{error}</p>

        <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
      </div>
    );
  }

  return (
    <main className="container">
      <h1>Our Products</h1>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
