import { useEffect, useState } from "react";
import { SiTorbrowser } from "react-icons/si";
import api from "../../../utils";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";

function Orders({ token, user, loading }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;

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

        const newOrders = response.data.data.map((order) => ({
          ...order,
          order: {
            ...order.order,
            products: order.order.products.map((item) => ({
              ...item,
              completed: false,
            })),
          },
        }));

        setOrders((prevOrders) => {
          const existingIds = prevOrders.map((o) => o.id);
          const ordersToAdd = newOrders.filter(
            (o) => !existingIds.includes(o.id)
          );
          return [...prevOrders, ...ordersToAdd];
        });
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        loading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const toggleItemCompleted = (orderIndex, itemIndex) => {
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].order.products[itemIndex].completed =
      !updatedOrders[orderIndex].order.products[itemIndex].completed;
    setOrders(updatedOrders);
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
              {order.order.note && (
                <>
                  <p>Nota: {order.order.note}</p>
                  <span className="separator" />
                </>
              )}
              {order.order.products.length > 0 &&
                order.order.products.map((item, index) => (
                  <>
                    {index > 0 && <span className="separator" />}
                    <div
                      key={index}
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
            </div>
          </div>
        ))}
    </div>
  );
}

export default Orders;
