import { IoMdCloseCircle } from "react-icons/io";
import Header from "../components/header";
import { useEffect, useState } from "react";
import api, { formatString } from "../utils";
import Popup from "../components/popup";

function Checkout({ cart, setCart, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    items: { products: [], note: "" },
  });
  const [order, setOrder] = useState({});

  const removeFromCart = (indexToRemove) => {
    loading(true);
    const updatedCart = cart.filter((a, index) => index !== indexToRemove);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    loading(false);
  };

  const _finalize = async () => {
    const name = form.name.trim();

    if (name === "" || name.length < 2) {
      setAlertMessage("Por favor, preencha com um nome válido");
      return;
    }
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
      setAlertMessage("O nome deve conter apenas letras");
      return;
    }

    try {
      api
        .post("/orders", {
          name: name,
          items: { products: cart, note: form.items.note },
        })
        .then((response) => setOrder(response.data.data));
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao finalizar pedido"
      );
    }
  };

  useEffect(() => {
    if (cart.length === 0) {
      window.location.href = "/";
    }
  }, [cart]);

  return (
    <div className="page" id="checkout">
      <Header></Header>
      {order.id ? (
        <div className="container">
          <div className="section">
            <b className="title">Sua Comanda</b>
            <p>
              {order.order_code} - {order.name}
            </p>
            <p>Valor a pagar: {order.total}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="container">
            <div className="section">
              <h2 className="title">Carrinho</h2>

              {cart.map((item, index) => (
                <div className="card">
                  <div className="card-content">
                    <h3 className="subtitle">{item.name}</h3>
                    {item.ingredients.length > 0 && (
                      <span className="content">
                        {formatString(item.ingredients)}
                      </span>
                    )}
                    {item.extra && item.extra.length > 0 && (
                      <span className="content">
                        <b>Extra: </b>
                        {formatString(item.extra, (item) => item.name)}
                      </span>
                    )}
                  </div>
                  <div className="card-actions">
                    <span className="price">
                      {item.totalPrice ? item.totalPrice : item.price}
                    </span>
                    <IoMdCloseCircle
                      size={"2rem"}
                      onClick={() => removeFromCart(index)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <span className="separator" />
            <div className="section">
              <h2 className="title">Nome</h2>
              <div className="card vertical">
                <input
                  type="text"
                  placeholder="Digite o seu nome"
                  value={form.name}
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(
                      /[^A-Za-zÀ-ÿ\s]/g,
                      ""
                    );
                    setForm({ ...form, name: onlyLetters });
                  }}
                />
              </div>
            </div>
            <span className="separator" />
            <div className="section">
              <h2 className="title">Observações</h2>
              <div className="card vertical">
                <div className="card-content">
                  <textarea
                    rows="4"
                    cols="50"
                    placeholder="Escreva aqui observações que gostaria de deixar ao pedido."
                    value={form.items.note}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        items: { ...form.items, note: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="action-row">
            <button
              className="invert"
              onClick={() => (window.location.href = "/")}
            >
              Voltar
            </button>
            <span className="price">
              Total: R$
              {cart
                .reduce(
                  (accumulator, item) =>
                    accumulator +
                    (item.totalPrice
                      ? parseFloat(item.totalPrice)
                      : parseFloat(item.price)),
                  0
                )
                .toFixed(2)}
            </span>
            <button onClick={() => _finalize()}>Finalizar</button>
          </div>
        </>
      )}
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </div>
  );
}

export default Checkout;
