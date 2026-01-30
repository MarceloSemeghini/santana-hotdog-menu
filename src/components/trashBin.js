import Modal from "./modal";
import api from "../utils";
import { useEffect, useState } from "react";

function TrashBin({ open, close, token, setAlertMessage, loading }) {
  const [canceledOrders, setCanceledOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders", {
        params: { status: "canceled" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordersData = response.data?.data || [];

      setCanceledOrders((prevOrders) =>
        ordersData.map((newOrder) => {
          const existing = prevOrders.find((o) => o.id === newOrder.id);
          const products =
            newOrder.items?.products?.map((p, idx) => ({
              ...p,
              completed: existing?.items?.products?.[idx]?.completed || false,
            })) || [];
          return { ...newOrder, items: { ...newOrder.items, products } };
        }),
      );
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar pedidos",
      );
    }
  };

  useEffect(() => {
    if (open) {
      loading(true);
      fetchOrders();
      loading(false);
    }
  }, [open]);

  const recoverOrder = async (orderId) => {
    try {
      loading(true);
      const response = await api.put("/orders", {
        id: orderId,
        status: "active",
      });
      if (response.data.status === "success") {
        setCanceledOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setAlertMessage(
          "Erro ao recuperar pedido, tente novamente mais tarde.",
        );
      }
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao recuperar pedido",
      );
    } finally {
      loading(false);
    }
  };

  const formatDateBR = (dateString) => {
    if (!dateString) return "";

    const dateData = new Date(dateString);
    const [year, month, day] = dateData.split("-");
    const date = `${day}/${month}/${year}`;
    return date;
  };

  return (
    <>
      <Modal active={open} close={() => close()}>
        <div className="trash-bin">
          {canceledOrders?.map((order) => {
            const [date, time] = order.created_at.split(" ");
            return (
              <div
                className="card"
                key={order.id}
                onClick={() => recoverOrder(order.id)}
              >
                <div className="card-content">
                  <p className="order-date">
                    <span>{formatDateBR(date)}</span>
                    <span>{time}</span>
                  </p>
                  <p>
                    <span className="order-code">{order.order_code}</span>
                    <span className="client-name">{order.name} - </span>
                    <span className="order-price">
                      R$
                      {parseFloat(order?.total_value)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

export default TrashBin;
