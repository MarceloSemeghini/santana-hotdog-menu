import { useParams } from "react-router-dom";
import api from "../utils";
import { useEffect, useState } from "react";
import Popup from "../components/popup";
import Header from "../components/header";

function OrderTicket({}) {
  const [alertMessage, setAlertMessage] = useState("");

  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrders = async () => {
    if (!orderId) return;
    try {
      const response = await api.get("/orders", {
        params: { id: orderId, status: "active" },
      });

      if (response.data.data.length > 0) {
        setOrder(response.data.data[0]);
      } else {
        window.location.href = "/";
      }

    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar o pedido",
      );
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderId]);

  return (
    <div className="page" id="checkout">
      <Header></Header>
      <div className="container" id="ticket">
        <div className="order-ticket">
          <span className="ticket-code">{order?.order_code}</span>
          <b className="title">Sua Comanda</b>
          <span className="separator" />
          <p>{order?.name}</p>
          <span className="separator" />
          {order?.total_value && (
            <p>
              Valor a pagar:{" "}
              <span style={{ whiteSpace: "nowrap" }}>
                <b>R${order?.total_value.replace(".", ",")}</b>
              </span>{" "}
            </p>
          )}
          <p className="cancel">
            Se deseja cancelar o seu pedido, por favor, dirija-se ao balcão.
          </p>
        </div>
        <Popup
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          type="alert"
        />
      </div>
    </div>
  );
}

export default OrderTicket;
