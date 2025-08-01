import { useEffect, useState } from "react";
import Header from "../components/header";
import api, { formatString } from "../utils";
import Floater from "../components/floater";
import { IoIosArrowForward } from "react-icons/io";

function Home({ cart, setCart, loading }) {
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [status, setStatus] = useState([]);

  useEffect(() => {
    try {
      loading(true);
      api.get("/menu").then((response) => {
        setCategories(response.data.data);
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(error.response?.data?.message || "Erro ao fazer buscar o cardápio");
    } finally {
      loading(false);
    }

    try {
      loading(true);
      api.get("/work_status").then((response) => {
        const usersStatus = response.data.data;

        if (usersStatus.includes("paused")) {
          setStatus("paused");
        } else if (usersStatus.includes("active")) {
          setStatus("active");
        } else {
          setStatus("inactive");
        }
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(error.response?.data?.message || "Erro ao fazer buscar o cardápio");
    } finally {
      loading(false);
    }
  }, [loading]);

  const addToCart = (item) => {
    const updatedCart = [...cart, item];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setSelectedItem({});
  };

  return (
    <div className="page" id="home">
      <Header></Header>
      <div className="container">
        {status}
        {categories &&
          categories.map(
            (category) =>
              category.items.length > 0 && (
                <div className="section" key={category.id}>
                  <h2 className="title">{category.name}</h2>
                  {category.items.map((item) => (
                    <div
                      className={`card ${
                        item.id === selectedItem.id ? "expand" : ""
                      }`}
                      key={item.id}
                    >
                      <div className="card-content">
                        <h3 className="subtitle">{item.name}</h3>
                        {item.ingredients && (
                          <span className="content">
                            {formatString(item.ingredients)}
                          </span>
                        )}
                      </div>
                      {item.id === selectedItem.id ? (
                        <div className="extra-content">
                          <ul>
                            {category.additions?.map((addition) => {
                              const isSelected =
                                selectedItem.extra?.some(
                                  (a) => a.name === addition.name
                                ) || false;

                              return (
                                <li
                                  key={addition.name}
                                  className={`content checkbox ${
                                    isSelected ? "selected" : ""
                                  }`}
                                  onClick={() => {
                                    const updatedExtras =
                                      selectedItem.extra || [];

                                    const newExtras = updatedExtras.some(
                                      (a) => a.name === addition.name
                                    )
                                      ? updatedExtras.filter(
                                          (a) => a.name !== addition.name
                                        )
                                      : [...updatedExtras, addition];

                                    setSelectedItem({
                                      ...selectedItem,
                                      extra: newExtras,
                                    });
                                  }}
                                >
                                  {addition.name} R${addition.price.toFixed(2)}
                                </li>
                              );
                            })}
                          </ul>
                          <div className="card-actions">
                            <span className="price">
                              R$
                              {(
                                parseFloat(selectedItem.price || 0) +
                                (selectedItem.extra?.reduce(
                                  (acc, addition) =>
                                    acc + parseFloat(addition.price),
                                  0
                                ) || 0)
                              ).toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                const basePrice = parseFloat(
                                  selectedItem.price || 0
                                );
                                const extrasTotal =
                                  selectedItem.extra?.reduce(
                                    (acc, addition) =>
                                      acc + parseFloat(addition.price),
                                    0
                                  ) || 0;

                                const updatedItem = {
                                  ...selectedItem,
                                  totalPrice: (basePrice + extrasTotal).toFixed(
                                    2
                                  ),
                                };

                                addToCart(updatedItem);
                              }}
                            >
                              Confirmar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="card-actions">
                          <span className="price">R${item.price}</span>
                          <button
                            onClick={() =>
                              category.additions.length > 0
                                ? setSelectedItem({ ...item, extra: [] })
                                : addToCart(item)
                            }
                          >
                            Adicionar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
          )}
      </div>
      <Floater condition={cart.length > 0}>
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
        <button onClick={() => (window.location.href = "/checkout")}>
          Finalizar <IoIosArrowForward size={"1rem"} />
        </button>
      </Floater>
    </div>
  );
}

export default Home;
