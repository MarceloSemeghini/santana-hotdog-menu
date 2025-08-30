import { useEffect, useState } from "react";
import { SiTorbrowser } from "react-icons/si";
import api from "../../../utils";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import Popup from "../../../components/popup";
import Modal from "../../../components/modal";
import { IoMdCheckmark } from "react-icons/io";

function Orders({ token, user, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [verify, setVerify] = useState("");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchOrders = async () => {
      try {
        loading(true);
        const response = await api.get("/orders", {
          params: { status: "active" },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const ordersData = response.data?.data || [];

        if (isMounted) {
          setOrders((prevOrders) => {
            return ordersData.map((newOrder) => {
              const existingOrder = prevOrders.find(
                (p) => p.id === newOrder.id
              );

              if (existingOrder) {
                return {
                  ...existingOrder,
                  ...newOrder,
                  items: {
                    ...newOrder.items,
                    products:
                      newOrder.items?.products?.map((p) => {
                        const existingProduct =
                          existingOrder.items?.products?.find(
                            (ep) => ep.id === p.id
                          );
                        return {
                          ...p,
                          completed: existingProduct
                            ? existingProduct.completed
                            : false,
                        };
                      }) || [],
                  },
                };
              } else {
                return {
                  ...newOrder,
                  items: {
                    ...newOrder.items,
                    products:
                      newOrder.items?.products?.map((p) => ({
                        ...p,
                        completed: false,
                      })) || [],
                  },
                };
              }
            });
          });
        }
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || "Erro ao buscar pedidos:",
          error
        );
      } finally {
        loading(false);
        if (isMounted) setTimeout(fetchOrders, 5000);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const _handleSubmit = (orderId, ignore = false) => {
    if (!ignore) {
      const order = orders.find((a) => a.id === orderId);

      const hasIncomplete = order.items.products.some(
        (item) => !item.completed
      );

      if (hasIncomplete) {
        setOpenModal(true);
        setVerify(orderId);
        return;
      }
    }
    try {
      loading(true);
      api.put("/orders", { id: orderId, status: "completed" }).then(() => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      });
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao atualizar o pedido dados"
      );
    } finally {
      setVerify("");
      loading(false);
    }
  };

  const toggleItemCompleted = (orderIndex, itemIndex) => {
    setOrders((prevOrders) =>
      prevOrders.map((order, oIdx) =>
        oIdx === orderIndex
          ? {
              ...order,
              items: {
                ...order.items,
                products: order.items.products.map((item, iIdx) =>
                  iIdx === itemIndex
                    ? { ...item, completed: !item.completed }
                    : item
                ),
              },
            }
          : order
      )
    );
  };

  return (
    <div className="container" style={{ alignItems: "center" }}>
      <div className="action">
        <b className="title">{orders.length} Pedidos </b>
        <SiTorbrowser size={"2rem"} className={`status ${user.status}`} />
      </div>
      {orders.length > 0 &&
        orders.map((order, orderIndex) => (
          <div key={order.id} className="card order">
            <div className="card-content">
              <h2 className="title">
                {order.order_code} - {order.name}{" "}
              </h2>
              {order.items.note && (
                <>
                  <p>Nota: {order.items.note}</p>
                  <span className="separator" />
                </>
              )}
              {order.items.products.length > 0 &&
                order.items.products.map((item, index) => (
                  <>
                    {index > 0 && <span className="separator" />}

                    <div
                      key={item.id || index}
                      onClick={() => toggleItemCompleted(orderIndex, index)}
                    >
                      <p>
                        {item.completed ? (
                          <ImCheckboxChecked />
                        ) : (
                          <ImCheckboxUnchecked />
                        )}{" "}
                        {item.name}
                      </p>
                      {item.extra?.length > 0 && (
                        <p>
                          Extra:{" "}
                          {item.extra.map((extra) => extra.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </>
                ))}
              <span className="separator" />
              <button
                className="finish"
                onClick={() => _handleSubmit(order.id)}
              >
                <IoMdCheckmark size={"2rem"} />
              </button>
            </div>
          </div>
        ))}

      <Modal active={openModal} close={() => setOpenModal(false)}>
        <p className="subtitle">
          Há itens que não foram preenchidos, deseja concluir o pedido?
        </p>
        <div className="action-row">
          <button
            className="cancel"
            onClick={() => {
              setOpenModal(false);
              setVerify("");
            }}
          >
            Cancelar
          </button>
          <button
            className="proceed"
            onClick={() => {
              setOpenModal(false);
              _handleSubmit(verify, true);
            }}
          >
            Prosseguir
          </button>
        </div>
      </Modal>
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </div>
  );
}

export default Orders;
