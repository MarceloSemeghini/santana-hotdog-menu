import { useEffect, useState } from "react";
import Header from "../components/header";
import api, { formatString } from "../utils";
import Floater from "../components/floater";
import { IoIosArrowForward } from "react-icons/io";
import Popup from "../components/popup";

function Home({ cart, setCart, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [selectedItem, setSelectedItem] = useState({});
  const [status, setStatus] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        loading(true);
        const menuResponse = await api.get("/menu");
        if (!isMounted) return;

        setPageInfo(
          menuResponse.data.data.find((a) => a.name === "info")?.additions || {}
        );
        setCategories(menuResponse.data.data.filter((a) => a.name !== "info"));

        const statusResponse = await api.get("/work_status");
        const usersStatus = statusResponse.data.data;

        if (usersStatus.includes("paused")) {
          setStatus("paused");
        } else if (usersStatus.includes("active")) {
          setStatus("active");
        } else {
          setStatus("inactive");
        }
      } catch (error) {
        setAlertMessage(error.response?.data?.message || "Erro ao buscar dados");
      } finally {
        loading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "paused" || status === "inactive" || pageInfo.vacation) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
    }
  }, [status, pageInfo.vacation, setCart]);

  const addToCart = (item) => {
    if (status === "paused" || status === "inactive" || pageInfo.vacation)
      return;

    const updatedCart = [...cart, item];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setSelectedItem({});
  };

  return (
    <div className="page" id="home">
      <Header></Header>
      <div className="container">
        {pageInfo.vacation ? (
          <h1>estamos de férias</h1>
        ) : status === "paused" && pageInfo.pauseWarning ? (
          <>
            <div className="card alert">
              <span className="title paused">{pageInfo.pauseWarning}</span>
            </div>
            <span className="separator" />
          </>
        ) : status === "inactive" && pageInfo.innactiveWarning ? (
          <>
            <div className="card alert">
              <span className="title inactive">
                {pageInfo.innactiveWarning}
              </span>
              <span>Aguardamos você de:</span>
              <ul>
                <li>Segunda {pageInfo.workingHours?.monday}</li>
                <li>Terça {pageInfo.workingHours?.tuesday}</li>
                <li>Quarta {pageInfo.workingHours?.wednesday}</li>
                <li>Quinta {pageInfo.workingHours?.thursday}</li>
                <li>Sexta {pageInfo.workingHours?.friday}</li>
                <li>Sábado {pageInfo.workingHours?.saturday}</li>
                <li>Domingo {pageInfo.workingHours?.sunday}</li>
              </ul>
            </div>
            <span className="separator" />
          </>
        ) : null}
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
      <Popup message={alertMessage} onClose={() => setAlertMessage("")} type="alert" />
    </div>
  );
}

export default Home;
