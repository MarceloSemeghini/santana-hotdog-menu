import { useState, useEffect } from "react";

function formatPrice(cents) {
  const value = (cents / 100).toFixed(2);
  return value.replace(".", ",");
}

function parseToCents(value) {
  return parseInt(value.replace(/\D/g, "") || "0", 10);
}

export default function PriceInput({ value, onChange, ...props }) {
  const [display, setDisplay] = useState("0,00");

  useEffect(() => {
    if (typeof value === "number") {
      const cents = Math.round(value * 100);
      setDisplay(formatPrice(cents));
    }
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    const cents = parseToCents(input);

    setDisplay(formatPrice(cents));
    onChange((cents / 100).toFixed(2)); 
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
    />
  );
}
