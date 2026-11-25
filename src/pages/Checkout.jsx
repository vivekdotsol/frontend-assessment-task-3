import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function isValidCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\s/g, "");

  if (!/^\d{16}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let doubleDigit = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

    if (doubleDigit) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function isValidExpiry(expiry) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
    return false;
  }

  const [month, year] = expiry.split("/").map(Number);

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear) return true;
  if (year < currentYear) return false;

  return month >= currentMonth;
}

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [apiError, setApiError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (form.fullName.trim().length < 1) {
      newErrors.fullName = "Full name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (form.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    if (!/^\d{5,6}$/.test(form.zipCode)) {
      newErrors.zipCode = "ZIP code must contain 5 or 6 digits";
    }

    if (!isValidCardNumber(form.cardNumber)) {
      newErrors.cardNumber = "Enter a valid 16-digit card number";
    }

    if (!isValidExpiry(form.expiry)) {
      newErrors.expiry = "Enter a valid future expiry date (MM/YY)";
    }

    if (!/^\d{3}$/.test(form.cvv)) {
      newErrors.cvv = "CVV must contain 3 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");

    if (items.length === 0) {
      setApiError("Your cart is empty.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const cardDigits = form.cardNumber.replace(/\s/g, "");

    const order = {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      })),

      totals: {
        subtotal: Number(totals.subtotal.toFixed(2)),
        discount: Number(totals.discount.toFixed(2)),
        total: Number(totals.total.toFixed(2)),
      },

      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        zipCode: form.zipCode,
      },

      cardLast4: cardDigits.slice(-4),
    };

    try {
      setLoading(true);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        },
      );

      if (!response.ok) {
        throw new Error("Order could not be placed. Please try again.");
      }

      const data = await response.json();

      clearCart();

      setForm({
        fullName: "",
        email: "",
        address: "",
        zipCode: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
      });

      setOrderId(data.id);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (orderId !== null) {
    return (
      <main className="container">
        <div className="success-box">
          <h1>Order successful!</h1>
          <p>Your order ID is: {orderId}</p>

          <button onClick={() => navigate("/")}>Continue shopping</button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/")}>Continue shopping</button>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        <label>
          Full Name
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <small>{errors.fullName}</small>}
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <small>{errors.email}</small>}
        </label>

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          {errors.address && <small>{errors.address}</small>}
        </label>

        <label>
          ZIP Code
          <input
            name="zipCode"
            inputMode="numeric"
            maxLength="6"
            value={form.zipCode}
            onChange={handleChange}
          />
          {errors.zipCode && <small>{errors.zipCode}</small>}
        </label>

        <label>
          Card Number
          <input
            name="cardNumber"
            inputMode="numeric"
            autoComplete="off"
            maxLength="16"
            value={form.cardNumber}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 16);

              setForm((current) => ({
                ...current,
                cardNumber: digits,
              }));
            }}
          />
          {errors.cardNumber && <small>{errors.cardNumber}</small>}
        </label>

        <div className="form-row">
          <label>
            Expiry (MM/YY)
            <input
              name="expiry"
              placeholder="MM/YY"
              maxLength="5"
              value={form.expiry}
              onChange={(event) => {
                let value = event.target.value.replace(/\D/g, "").slice(0, 4);

                if (value.length > 2) {
                  value = value.slice(0, 2) + "/" + value.slice(2);
                }

                setForm((current) => ({
                  ...current,
                  expiry: value,
                }));
              }}
            />
            {errors.expiry && <small>{errors.expiry}</small>}
          </label>

          <label>
            CVV
            <input
              name="cvv"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength="3"
              value={form.cvv}
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 3);

                setForm((current) => ({
                  ...current,
                  cvv: digits,
                }));
              }}
            />
            {errors.cvv && <small>{errors.cvv}</small>}
          </label>
        </div>

        <div className="checkout-total">
          <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
          <p>Discount: -${totals.discount.toFixed(2)}</p>
          <h2>Total: ${totals.total.toFixed(2)}</h2>
        </div>

        {apiError && <p className="error-message">{apiError}</p>}

        <button type="submit" disabled={loading || items.length === 0}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </main>
  );
}
