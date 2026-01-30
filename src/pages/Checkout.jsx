import Header from "../components/header";
import { useEffect, useMemo, useState } from "react";
import api, { formatString } from "../utils";
import Popup from "../components/popup";
import Modal from "../components/modal";
import { IoClose, IoLocationOutline } from "react-icons/io5";
import { MdDeliveryDining } from "react-icons/md";
import Floater from "../components/floater";
import { FaMinus, FaPlus } from "react-icons/fa6";

function Checkout({ cart, setCart, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    items: [],
    address: { postalCode: "", address: "", number: "", complement: "" },
    payment: { type: "PIX", change: "" },
    phone: "",
    note: "",
  });

  const cartTotal = useMemo(() => {
    const total = cart.reduce(
      (accumulator, item) =>
        accumulator +
        (item.quantity ?? 1) *
          (item.totalPrice
            ? parseFloat(item.totalPrice)
            : parseFloat(item.price)),
      0,
    );
    return total;
  }, [cart]);

  const [orderType, setOrderType] = useState("local");

  const canProceed = useMemo(() => {
    if (form.name.trim().length >= 2) {
      if (orderType === "local") {
        return true;
      } else {
        if (
          form.address?.postalCode &&
          form.address?.postalCode.length === 8 &&
          form.address?.address &&
          form.address?.number
        ) {
          return true;
        }
      }
    }
    return false;
  }, [form, orderType]);

  const increaseQuantity = (index) => {
    const updatedCart = [...cart];

    updatedCart[index] = {
      ...updatedCart[index],
      quantity: (updatedCart[index].quantity ?? 1) + 1,
    };

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const decreaseQuantity = (index) => {
    const updatedCart = [...cart];
    const currentQty = updatedCart[index]?.quantity ?? 1;

    if (currentQty <= 1) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: currentQty - 1,
      };
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

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

  const maskCEP = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return digits.slice(0, 5) + "-" + digits.slice(5, 8);
  };

  const maskPhone = (value) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 2) return digits;
    if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(
      3,
      7,
    )}-${digits.slice(7, 11)}`;
  };

  const handleSelectPayment = (event) => {
    setForm({
      ...form,
      payment: { ...form.payment, type: event.target.value },
    });
  };

  const handleSearchPostalCode = async (postalCode) => {
    if (!postalCode || postalCode.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${postalCode}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        setForm({
          ...form,
          address: {
            postalCode: form.address.postalCode,
          },
        });
        setAlertMessage("CEP não encontrado");
        return;
      }

      if (data.localidade !== "Santa Lúcia") {
        setForm({
          ...form,
          address: {
            postalCode: form.address.postalCode,
          },
        });
        setOpenModal(true);
        return;
      }

      setForm({
        ...form,
        address: {
          ...form.address,
          district: data.bairro,
          address: data.logradouro,
        },
      });
    } catch (error) {
      setAlertMessage("Erro ao buscar o CEP");
    }
  };

  const _finalize = async () => {
    const name = form.name.trim();

    if (name === "" || name.length < 2) {
      setAlertMessage("Por favor, preencha com um nome válido");
      return;
    }
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
      setAlertMessage("O nome deve conter apenas letras");
      return;
    }
    if (orderType === "delivery") {
      if (!form.phone) {
        setAlertMessage("Por favor, informe o número para contato");
        return;
      }
      if (!form.payment) {
        setAlertMessage("Por favor, informe a forma de pagamento");
        return;
      }
      if (
        !form.address?.postalCode ||
        !form.address?.address ||
        !form.address?.number
      ) {
        setAlertMessage("Por favor, preencha o endereço completo para entrega");
        return;
      }
    }

    try {
      const payload = {
        name,
        items: cart,
        note: form.note,
        cartTotal,
      };

      if (orderType === "delivery") {
        payload.address = form.address;
        payload.payment = form.payment;
        payload.phone = form.phone;
      }

      const response = await api.post("/orders", payload);

      window.location.href = `/checkout/${response.data.data.id}`;
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao finalizar pedido",
      );
    }
  };

  console.log(form);

  return (
    <div className="page" id="checkout">
      <Header></Header>
      <>
        <div className="container">
          <div className="section">
            <h2 className="title">Carrinho</h2>

            {cart.map((item, index) => (
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
                      {parseFloat(
                        item.totalPrice ? item.totalPrice : item.price,
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    <IoClose
                      size={"2rem"}
                      onClick={() => removeFromCart(index)}
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
          </div>
          <span className="separator" />
          <div className="section">
            <h2 className="title" style={{ margin: "unset" }}>
              Nome
            </h2>
            <div className="client-info-section">
              <input
                type="text"
                placeholder="Digite o seu nome"
                value={form.name}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(
                    /[^A-Za-zÀ-ÿ\s]/g,
                    "",
                  );
                  setForm({ ...form, name: onlyLetters });
                }}
              />
            </div>
          </div>
          <span className="separator" />
          <div className="order-type">
            <button
              className={orderType === "local" ? "active" : "inactive"}
              onClick={() => !(orderType === "local") && setOrderType("local")}
            >
              <IoLocationOutline size={"1.5rem"} />
              Irei retirar no local
            </button>
            <button
              className={orderType === "delivery" ? "active" : "inactive"}
              onClick={() =>
                !(orderType === "delivery") && setOrderType("delivery")
              }
            >
              <MdDeliveryDining size={"1.5rem"} />
              Quero entrega em domicílio
            </button>
          </div>

          {orderType === "delivery" && (
            <>
              <span className="separator" />
              <h2 className="title" style={{ margin: "unset" }}>
                Forma de Pagamento
              </h2>
              <div className="client-info-section">
                <div className="radio-selection">
                  <label>
                    <input
                      type="radio"
                      value="PIX"
                      checked={form.payment.type === "PIX"}
                      onChange={handleSelectPayment}
                    />
                    <span>PIX</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="Dinheiro"
                      checked={form.payment.type === "Dinheiro"}
                      onChange={handleSelectPayment}
                    />
                    <span>Dinheiro</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="Débito"
                      checked={form.payment.type === "Débito"}
                      onChange={handleSelectPayment}
                    />
                    <span>Débito</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="Crédito"
                      checked={form.payment.type === "Crédito"}
                      onChange={handleSelectPayment}
                    />
                    <span>Crédito</span>
                  </label>
                </div>
                {form.payment.type === "Dinheiro" && (
                  <input
                    type="number"
                    value={form.payment.change}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        payment: {
                          ...form.payment,
                          change: event.target.value,
                        },
                      })
                    }
                    placeholder="Troco para quanto"
                  />
                )}
              </div>
              <span className="separator" />

              <h2 className="title" style={{ margin: "unset" }}>
                Telefone Para Contato
              </h2>
              <div className="client-info-section">
                <input
                  placeholder="Número de telefone para contato"
                  type="text"
                  value={maskPhone(form.phone || "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");

                    setForm({
                      ...form,
                      phone: raw,
                    });
                  }}
                />
              </div>
              <span className="separator" />

              <h2 className="title" style={{ margin: "unset" }}>
                Endereço de Entrega
              </h2>
              <div className="client-info-section">
                <input
                  type="text"
                  placeholder="Digite o CEP"
                  maxLength={9}
                  value={maskCEP(form.address?.postalCode || "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");

                    setForm({
                      ...form,
                      address: {
                        ...form.address,
                        postalCode: raw,
                      },
                    });
                  }}
                  onBlur={() =>
                    handleSearchPostalCode(form.address?.postalCode)
                  }
                />
                <input
                  type="text"
                  placeholder="Nome do Bairro"
                  disabled
                  value={form.address?.district || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      address: { ...form.address, district: e.target.value },
                    });
                  }}
                />
                <input
                  type="text"
                  placeholder="Nome da Rua"
                  disabled
                  value={form.address?.address || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      address: { ...form.address, address: e.target.value },
                    });
                  }}
                />
                <input
                  type="text"
                  placeholder="Número da Residência"
                  value={form.address?.number || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      address: { ...form.address, number: e.target.value },
                    });
                  }}
                />
                <input
                  type="text"
                  placeholder="Complemento do endereço"
                  value={form.address?.complement || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      address: {
                        ...form.address,
                        complement: e.target.value,
                      },
                    });
                  }}
                />
              </div>
            </>
          )}
          <span className="separator" />
          <div className="section">
            <h2 className="title" style={{ margin: "unset" }}>
              Observações
            </h2>
            <div className="client-info-section">
              <textarea
                rows="4"
                cols="50"
                placeholder="Escreva aqui observações que gostaria de deixar ao pedido."
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
        <Floater>
          <button
            className="invert"
            onClick={() => (window.location.href = "/")}
          >
            Voltar
          </button>
          <div className="total-wrapper">
            <span className="price">
              <p>Total:</p>
              <p className="value">
                R$
                {cartTotal.toFixed(2).replace(".", ",")}
              </p>
            </span>
            <button onClick={() => _finalize()} disabled={!canProceed}>
              Finalizar
            </button>
          </div>
        </Floater>
      </>
      <Modal active={openModal} close={() => setOpenModal(false)}>
        Ops! Infelizmente nossa entrega é só para a cidade de Santa Lúcia. Mas
        aproveite para vir nos visitar!
      </Modal>
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </div>
  );
}

export default Checkout;
