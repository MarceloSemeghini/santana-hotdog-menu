import { useEffect, useRef, useState } from "react";
import { SiTorbrowser } from "react-icons/si";
import api, { formatString } from "../../../utils";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import Popup from "../../../components/popup";
import Modal from "../../../components/modal";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { FaCheck, FaMinus, FaPlus, FaTruck } from "react-icons/fa6";
import { FaEdit, FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { PiSelectionInverse } from "react-icons/pi";

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

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders?include_items=true", {
        params: { status: "active" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordersData = response.data?.data || [];

      setOrders((prevOrders) =>
        ordersData.map((newOrder) => {
          const existing = prevOrders.find((o) => o.id === newOrder.id);

          const items = newOrder.items.map((item, idx) => ({
            ...item,
            completed: existing?.items?.[idx]?.completed || false,
          }));

          return {
            ...newOrder,
            items,
          };
        }),
      );
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar pedidos",
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

  const increaseQuantity = (index) => {
    const updatedCart = [...selectedOrder.items];

    updatedCart[index] = {
      ...updatedCart[index],
      quantity: (updatedCart[index].quantity ?? 1) + 1,
    };

    setSelectedOrder({ ...selectedOrder, items: updatedCart });
  };

  const decreaseQuantity = (index) => {
    const updatedCart = [...selectedOrder.items];
    const currentQty = updatedCart[index]?.quantity ?? 1;

    if (currentQty <= 1) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: currentQty - 1,
      };
    }

    setSelectedOrder({ ...selectedOrder, items: updatedCart });
  };

  const removeFromOrder = (indexToRemove) => {
    loading(true);
    const updatedCart = selectedOrder.items.filter(
      (a, index) => index !== indexToRemove,
    );
    setSelectedOrder({ ...selectedOrder, items: updatedCart });
    loading(false);
  };

  const toggleItemCompleted = (orderId, itemIndex) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item, idx) =>
                idx === itemIndex
                  ? { ...item, completed: !item.completed }
                  : item,
              ),
            }
          : order,
      ),
    );
  };

  const updateOrder = async (order) => {
    const orderNewValue = selectedOrder?.items
      .reduce(
        (accumulator, item) =>
          accumulator +
          (item.quantity ?? 1) *
            (item.totalPrice
              ? parseFloat(item.totalPrice)
              : parseFloat(item.price)),
        0,
      )
      .toFixed(2)
      .replace(".", ",");
    try {
      loading(true);
      const response = await api.put("/orders", {
        id: order.id,
        items: order.items,
        cartTotal: orderNewValue,
      });

      if (response.data.status === "success") {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  items: order.items,
                  total_value: orderNewValue,
                }
              : o,
          ),
        );
      }
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao atualizar pedido",
      );
    } finally {
      loading(false);
      setSelectedOrder(null);
    }
  };

  const requestCompleteOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    console.log(order);
    if (!order) return;

    const hasIncomplete = order.items.some((item) => !item.completed);

    if (hasIncomplete) {
      setConfirmationType("complete");
      setSelectedOrderId(orderId);
      setOpenModal(true);
    } else {
      executeOrderStatusUpdate(orderId, "completed");
    }
  };

  const executeOrderStatusUpdate = async (orderId, status) => {
    try {
      loading(true);
      const response = await api.put("/orders", { id: orderId, status });

      if (response.data.status === "success") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setAlertMessage("Erro ao atualizar pedido");
      }
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao atualizar pedido",
      );
    } finally {
      loading(false);
      setSelectedOrderId(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedOrderId) return;

    if (confirmationType === "complete") {
      executeOrderStatusUpdate(selectedOrderId, "completed");
    } else if (confirmationType === "cancel") {
      executeOrderStatusUpdate(selectedOrderId, "canceled");
    }

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
        <div key={order.id} className="card order" id="checkout">
          <div className="card-content">
            <h2 className="title action">
              {order.order_code} - {order.name}
              <FaEdit size={"2rem"} onClick={() => setSelectedOrder(order)} />
            </h2>

            {order?.note && (
              <>
                <span className="separator" />
                <p className="order-note">
                  <b>Nota:</b> {order.note}
                </p>
              </>
            )}

            {order?.items?.map((item, index) => (
              <>
                <span className="separator" />

                <div
                  key={item.id + index}
                  className="order-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItemCompleted(order.id, index);
                  }}
                >
                  <h3 className="subtitle">
                    <b>{item.quantity}x</b> {item.name}
                  </h3>
                  {item.extra?.length > 0 && (
                    <p>Extra: {item.extra.map((e) => e.name).join(", ")}</p>
                  )}
                  {item.completed && <FaCheck size={"2rem"} />}
                </div>
              </>
            ))}

            {order?.phone && (
              <>
                <span className="separator" />
                <div className="order-address">
                  <p>
                    <b>Telefone:</b>{" "}
                    {`(${order.phone.slice(0, 2)}) ${order.phone[2]} ${order.phone.slice(3, 7)} - ${order.phone.slice(7, 11)}`}
                  </p>
                </div>
              </>
            )}

            {order?.address && (
              <>
                <span className="separator" />
                <div className="order-address">
                  <p>
                    <b>Cep:</b>{" "}
                    {order?.address.postalCode.slice(0, 5) +
                      "-" +
                      order?.address.postalCode.slice(5)}
                  </p>
                  <p>
                    <b>Bairro:</b> {order?.address.district}
                  </p>
                  <p>
                    <b>Rua:</b> {order?.address.address}
                  </p>
                  <p>
                    <b>Número:</b> {order?.address.number}
                  </p>
                </div>
              </>
            )}

            <span className="separator" />
            <p className="total">
              <b>Total: R$ {order?.total_value.replace(".", ",")}</b>
            </p>

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
                onClick={() => requestCompleteOrder(order.id)}
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

      <Modal active={selectedOrder?.id} close={() => setSelectedOrder(null)}>
        <div className="section" id="checkout">
          {selectedOrder?.items.map((item, index) => (
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
              <div className="card-value-control">
                <div className="card-actions">
                  <span className="price" style={{ whiteSpace: "nowrap" }}>
                    R${" "}
                    {parseFloat(item.totalPrice ? item.totalPrice : item.price)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                  <IoClose
                    size={"2rem"}
                    onClick={() => removeFromOrder(index)}
                  />
                </div>
                <div className="quantity">
                  <FaMinus
                    className="active"
                    size={"1.5rem"}
                    onClick={() => decreaseQuantity(index)}
                  />

                  <span>{item.quantity ?? 1} x</span>

                  <FaPlus
                    className="active"
                    size={"1.5rem"}
                    onClick={() => increaseQuantity(index)}
                  />
                </div>
              </div>
            </div>
          ))}
          {selectedOrder && (
            <div className="total-wrapper action">
              <span className="price">
                <p className="value">
                  Total: R$
                  {selectedOrder?.items
                    .reduce(
                      (accumulator, item) =>
                        accumulator +
                        (item.quantity ?? 1) *
                          (item.totalPrice
                            ? parseFloat(item.totalPrice)
                            : parseFloat(item.price)),
                      0,
                    )
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </span>
              <FaSave
                size={"2rem"}
                onClick={() => updateOrder(selectedOrder)}
              />
            </div>
          )}
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
