import { useEffect, useRef, useState } from "react";
import { SiTorbrowser } from "react-icons/si";
import api from "../../../utils";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import Popup from "../../../components/popup";
import Modal from "../../../components/modal";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { FaTruck } from "react-icons/fa6";

function Orders({ token, user, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [orders, setOrders] = useState([]);
  const intervalRef = useRef(null);

  const [selectedTab, setSelectedTab] = useState("local");

  const deliveryOrders = orders.filter((order) => order.address);
  const localOrders = orders.filter((order) => !order.address);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders", {
        params: { status: "active" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordersData = response.data?.data || [];

      setOrders((prevOrders) =>
        ordersData.map((newOrder) => {
          const existing = prevOrders.find((o) => o.id === newOrder.id);
          const products =
            newOrder.items?.products?.map((p, idx) => ({
              ...p,
              completed: existing?.items?.products?.[idx]?.completed || false,
            })) || [];
          return { ...newOrder, items: { ...newOrder.items, products } };
        })
      );
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar pedidos"
      );
    }
  };

  useEffect(() => {
    if (!token) return;
    loading(true);
    fetchOrders();
    loading(false);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (user.status === "inactive") return;

    if (document.hidden) return;

    fetchOrders();

    intervalRef.current = setInterval(fetchOrders, 10000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [token, user.status, document.hidden]);

  const toggleItemCompleted = (orderId, itemIndex) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
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

  const _updateOrderStatus = async (
    orderId,
    status,
    ignoreIncomplete = false
  ) => {
    const order = orders.find((o) => o.id === orderId);

    if (!ignoreIncomplete && status === "completed") {
      const hasIncomplete = order.items.products.some(
        (item) => !item.completed
      );
      if (hasIncomplete) {
        setConfirmationType("complete");
        setSelectedOrderId(orderId);
        setOpenModal(true);
        return;
      }
    }

    try {
      loading(true);
      const response = await api.put("/orders", { id: orderId, status });
      if (response.status === "success") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setAlertMessage(
          "Erro ao atualizar pedido, tente novamente mais tarde."
        );
      }
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao atualizar pedido"
      );
    } finally {
      setSelectedOrderId(null);
      loading(false);
    }
  };

  const handleConfirm = (ignore = false) => {
    if (!selectedOrderId) return;

    if (confirmationType === "complete")
      _updateOrderStatus(selectedOrderId, "completed", ignore);
    else if (confirmationType === "cancel")
      _updateOrderStatus(selectedOrderId, "canceled");
    setOpenModal(false);
  };

  return (
    <div className="container" style={{ alignItems: "center" }}>
      <div className="order-type-selection">
        <span
          className={`local-orders ${selectedTab === "local" ? "active" : ""}`}
          onClick={() => setSelectedTab("local")}
        >
          {localOrders.length} <FaTruck size={"1.8rem"} />
        </span>

        <SiTorbrowser size={"2rem"} className={`status ${user.status}`} />

        <span
          className={`delivery-orders ${
            selectedTab === "delivery" ? "active" : ""
          }`}
          onClick={() => setSelectedTab("delivery")}
        >
          {deliveryOrders.length} <MdDeliveryDining size={"2rem"} />
        </span>
      </div>

      {(selectedTab === "local" ? localOrders : deliveryOrders).map((order) => (
        <div key={order.id} className="card order">
          <div className="card-content">
            <h2 className="title">
              {order.order_code} - {order.name}
            </h2>

            {order.items.note && (
              <>
                <p>Nota: {order.items.note}</p>
                <span className="separator" />
              </>
            )}

            {order.items.products?.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => toggleItemCompleted(order.id, index)}
              >
                {index > 0 && <span className="separator" />}
                <p>
                  {item.completed ? (
                    <ImCheckboxChecked />
                  ) : (
                    <ImCheckboxUnchecked />
                  )}{" "}
                  {item.name}
                </p>
                {item.extra?.length > 0 && (
                  <p>Extra: {item.extra.map((e) => e.name).join(", ")}</p>
                )}
              </div>
            ))}

            {order?.address && (
              <>
                <span className="separator" />
                <div className="order-address">
                  <p><b>Cep:</b> {order?.address.postalCode.slice(0, 5) + "-" + order?.address.postalCode.slice(5)}</p>
                  <p><b>Bairro:</b> {order?.address.district}</p>
                  <p><b>Rua:</b> {order?.address.address}</p>
                  <p><b>Número:</b> {order?.address.number}</p>
                </div>
              </>
            )}

            <span className="separator" />
            <div className="order-actions">
              <button
                className="cancel"
                onClick={() => {
                  setConfirmationType("cancel");
                  setSelectedOrderId(order.id);
                  setOpenModal(true);
                }}
              >
                <IoMdClose size={"2rem"} />
              </button>
              <button
                className="finish"
                onClick={() => _updateOrderStatus(order.id, "completed")}
              >
                <IoMdCheckmark size={"2rem"} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <Modal active={openModal} close={() => setOpenModal(false)}>
        {confirmationType === "complete"
          ? "Há itens que não foram preenchidos, deseja concluir o pedido?"
          : "Você tem certeza que deseja prosseguir com o cancelamento desse pedido?"}
        <p className="subtitle"></p>
        <div className="action-row">
          <button
            className="cancel"
            onClick={() => {
              setOpenModal(false);
              setSelectedOrderId(null);
            }}
          >
            Cancelar
          </button>
          <button className="proceed" onClick={() => handleConfirm(true)}>
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
