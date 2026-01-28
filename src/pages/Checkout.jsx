import { IoMdCloseCircle } from "react-icons/io";
import Header from "../components/header";
import { useEffect, useMemo, useState } from "react";
import api, { formatString } from "../utils";
import Popup from "../components/popup";
import Modal from "../components/modal";
import { IoLocationOutline } from "react-icons/io5";

function Checkout({ cart, setCart, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    items: { products: [], note: "" },
  });

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

  const handleSearchPostalCode = async (postalCode) => {
    if (!postalCode || postalCode.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${postalCode}/json/`
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

  const _finalize = () => {
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
      api
        .post("/orders", {
          name: name,
          items: { products: cart, note: form.items.note },
          address: orderType === "delivery" ? form.address : null,
        })
        .then((response) => {
          window.location.href = `/checkout/${response.data.data.id}`;
        });
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao finalizar pedido"
      );
    }
  };

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
                <div className="card-actions">
                  <span className="price">
                    {item.totalPrice ? item.totalPrice : item.price}
                  </span>
                  <IoMdCloseCircle
                    size={"2rem"}
                    onClick={() => removeFromCart(index)}
                  />
                </div>
              </div>
            ))}
          </div>
          <span className="separator" />
          <div className="section">
            <h2 className="title">Nome</h2>
            <div className="card vertical">
              <input
                type="text"
                placeholder="Digite o seu nome"
                value={form.name}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(
                    /[^A-Za-zÀ-ÿ\s]/g,
                    ""
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
              <IoLocationOutline size={"1rem"} />
              Irei retirar no local
            </button>
            <button
              className={orderType === "delivery" ? "active" : "inactive"}
              onClick={() =>
                !(orderType === "delivery") && setOrderType("delivery")
              }
            >
              Quero entrega em domicílio
            </button>
          </div>

          {orderType === "delivery" && (
            <>
              <span className="separator" />
              <h2 className="title">Endereço de Entrega</h2>
              <div className="card vertical">
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
            <h2 className="title">Observações</h2>
            <div className="card vertical">
              <div className="card-content">
                <textarea
                  rows="4"
                  cols="50"
                  placeholder="Escreva aqui observações que gostaria de deixar ao pedido."
                  value={form.items.note}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      items: { ...form.items, note: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="action-row">
          <button
            className="invert"
            onClick={() => (window.location.href = "/")}
          >
            Voltar
          </button>
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
          <button onClick={() => _finalize()} disabled={!canProceed}>
            Finalizar
          </button>
        </div>
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
