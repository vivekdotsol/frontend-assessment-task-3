import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    items,
    notice,
    setNotice,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
  } = useCart();

  function handleQuantityChange(id, value) {
    if (!/^(10|[1-9])$/.test(value)) {
      return;
    }

    updateQuantity(id, Number(value));
  }

  return (
    <main className="container">
      <h1>Your Cart</h1>

      {notice && (
        <div className="notice">
          {notice}
          <button onClick={() => setNotice("")}>Close</button>
        </div>
      )}

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/">Continue shopping</Link>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.thumbnail} alt={item.title} />

              <div className="cart-info">
                <h3>{item.title}</h3>

                <p>Price: ${item.price.toFixed(2)}</p>

                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                  />
                </label>

                <p>Line total: ${(item.price * item.quantity).toFixed(2)}</p>

                <button
                  className="danger-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>

            <p>
              Discount: -${totals.discount.toFixed(2)}
              {totals.subtotal > 100 && " (10%)"}
            </p>

            <h2>Total: ${totals.total.toFixed(2)}</h2>

            <div className="button-row">
              <button className="danger-button" onClick={clearCart}>
                Clear Cart
              </button>

              <Link to="/checkout" className="button-link">
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
