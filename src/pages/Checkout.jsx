import { IoMdCloseCircle } from "react-icons/io";
import Header from "../components/header";
import { useEffect } from "react";
import api, { formatString } from "../utils";

function Checkout({ cart, setCart, loading }) {
  const removeFromCart = (indexToRemove) => {
    loading(true);
    const updatedCart = cart.filter((a, index) => index !== indexToRemove);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    loading(false);
  };

  const _finalize = async () => {
    api.post("/orders", {name: "Marcelo", order: []}).then((response) =>
      console.log(response)
    )
  }

  useEffect(() => {
    if (cart.length === 0) {
      window.location.href = "/";
    }
  }, [cart]);

  return (
    <div className="page" id="checkout">
      <Header></Header>
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
            <input type="text" placeholder="Digite o seu nome" />
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
              />
            </div>
          </div>
        </div>
      </div>
      <div className="action-row">
        <button className="invert" onClick={() => (window.location.href = "/")}>
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
    </div>
  );
}

export default Checkout;
