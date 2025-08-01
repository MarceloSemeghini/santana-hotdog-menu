import { IoMdCloseCircle } from "react-icons/io";
import Header from "../components/header";
import { useEffect } from "react";

function Checkout({ cart, setCart, loading }) {
  const removeFromCart = (indexToRemove) => {
    loading(true);
    const updatedCart = cart.filter((a, index) => index !== indexToRemove);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    loading(false);
  };

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
                <span className="content">
                  {item.ingredients.map((ingredient, index) =>
                    index === 0
                      ? ingredient.charAt(0).toUpperCase() +
                        ingredient.slice(1) +
                        ", "
                      : item.ingredients.length === index + 2
                      ? `${ingredient} e `
                      : item.ingredients.length === index + 1
                      ? ` ${ingredient}.`
                      : `${ingredient}, `
                  )}
                </span>
                {item.extra && (
                  <span className="content">
                    <b>Extra: </b>
                    {item.extra.map((addition, index) =>
                      index === 0
                        ? addition.name.charAt(0).toUpperCase() +
                          addition.name.slice(1) +
                          ", "
                        : item.extra.length === index + 2
                        ? `${addition.name} e `
                        : item.extra.length === index + 1
                        ? ` ${addition.name}.`
                        : `${addition.name}, `
                    )}
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
        <button>Finalizar</button>
      </div>
    </div>
  );
}

export default Checkout;
