import { useParams } from "react-router-dom";
import api from "../utils";
import { useEffect, useMemo, useState } from "react";
import Popup from "../components/popup";
import Header from "../components/header";

function OrderTicket({}) {
  const [alertMessage, setAlertMessage] = useState("");

  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const total = useMemo(() => {
    if (!order || !order.items) return "R$ 0,00";
    const sum = order?.items?.products?.reduce(
      (acc, item) =>
        item.quantity
          ? acc + parseFloat(item.price) * item.quantity
          : acc + parseFloat(item.price),
      0
    );
    return `R$ ${sum.toFixed(2).replace(".", ",")}`;
  }, [order]);

  const fetchOrders = async () => {
    if (!orderId) return;
    try {
      const response = await api.get("/orders", {
        params: { id: orderId },
      });

      setOrder(response.data.data[0]);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar o pedido"
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
          <p>
            Valor a pagar: <span style={{ whiteSpace: "nowrap" }}>{total}</span>{" "}
          </p>
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
