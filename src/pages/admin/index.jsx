import { useEffect, useState } from "react";
import Header from "../../components/header";
import Actions from "../../components/actions";
import axios from "axios";
import api from "../../config";
import { FaCirclePlus, FaCopy, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import Modal from "../../components/modal";

function Admin() {
  const token = localStorage.getItem("authToken");
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({});
  const [type, setType] = useState("");
  const defaultCategory = { name: "", additions: [] };
  const defaultAddition = {
    name: "",
    price: 0.0,
  };
  const defaultItem = {
    name: "",
    price: 0.0,
    ingredients: [],
  };

  const _openModal = (form, type) => {
    setOpenModal(true);
    setForm(form);
    setType(type);
  };

  const _handleDelete = async (type, id) => {
    switch (type) {
      case "category":
        try {
          await axios.delete(`${api}/menu/categories?id=${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          setCategories((prev) => prev.filter((cat) => cat.id !== id));
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth";
          } else {
            console.error(
              "Erro ao deletar categoria:",
              error.response?.data || error.message
            );
          }
        }
        break;
      default:
        break;
    }
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();
    switch (type) {
      case "category":
        try {
          const response = await axios.post(`${api}/menu/categories`, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const createdCategory = {
            ...form,
            id: response.data.categoryId,
            items: [],
          };

          setCategories((prev) => [...prev, createdCategory]);
          setOpenModal(false);
          setForm({});
        } catch (error) {
          if (error.response && error.response.status === 401) {
          } else {
            console.error(
              "Erro ao criar categoria:",
              error.response?.data || error.message
            );
          }
        }
        break;
      case "item":
        try {
          const response = await axios.post(`${api}/menu/items`, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          if (error.response && error.response.status === 401) {
          } else {
            console.error(
              "Erro ao criar categoria:",
              error.response?.data || error.message
            );
          }
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (token) {
      try {
        axios.get(`${api}/menu.php`).then((response) => {
          setCategories(response.data.data);
        });
      } catch (error) {
        console.error("Erro ao enviar:", error);
        alert(error.response?.data?.message || "Erro ao fazer login");
      }
    } else {
      window.location.href = "/auth";
    }
  }, [token]);

  return (
    <div className="page" id="admin">
      <Header></Header>
      <div className="container">
        <b className="title action">
          Categorias{" "}
          <FaCirclePlus
            size={"2rem"}
            onClick={() => _openModal(defaultCategory, "category")}
          />
        </b>
        {categories &&
          categories.map((category) => (
            <div className="section" key={category.name}>
              <h2 className="title action">
                {category.name}
                <Actions>
                  <FaEdit size={"2rem"} />
                  <FaCopy size={"2rem"} />
                  <FaTrash
                    size={"2rem"}
                    onClick={() => _handleDelete("category", category.id)}
                  />
                </Actions>
              </h2>
              <h2 className="subtitle action">
                Itens{" "}
                <FaCirclePlus
                  size={"1.5rem"}
                  onClick={() => _openModal(defaultItem, "item")}
                />
              </h2>
              {category.items.map((item) => (
                <div className="card" key={item.name}>
                  <div className="card-content">
                    <h3 className="subtitle">{item.name} </h3>
                    <div className="list">
                      {item.ingredients &&
                        item.ingredients.map((ingredient, index) => (
                          <span
                            className="content item"
                            key={`${item.name}_${index}`}
                          >
                            {ingredient}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="card-actions">
                    <Actions>
                      <FaEdit size={"2rem"} />
                      <FaCopy size={"2rem"} />
                      <FaTrash size={"2rem"} />
                    </Actions>
                    <span className="price">
                      {parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <span className="subtitle action">
                Adições <FaCirclePlus size={"1.5rem"} />
              </span>
              {category.additions.length > 0 && (
                <div className="card">
                  <div className="card-content list">
                    {category.additions.map((addition) => (
                      <p className="content item" key={addition.name}>
                        {addition.name} R${addition.price.toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
      <Modal active={openModal} close={() => setOpenModal(false)}>
        {(() => {
          switch (type) {
            case "category":
              return (
                <form onSubmit={(e) => _handleSubmit(e)}>
                  <label htmlFor="category_name" className="subtitle">
                    Nome da Categoria
                  </label>
                  <input
                    id="category_name"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <span className="subtitle action">
                    Adições da Categoria{" "}
                    <FaCirclePlus
                      size={"1.5rem"}
                      onClick={() =>
                        setForm({
                          ...form,
                          additions: [
                            ...(form.additions || []),
                            { ...defaultAddition },
                          ],
                        })
                      }
                    />
                  </span>
                  <div className="subform">
                    {form.additions.map((addition, index) => (
                      <>
                        <label
                          htmlFor={`addition_name_${index}`}
                          className="subtitle action"
                        >
                          nome
                          <FaTrash
                            size={"1.5rem"}
                            onClick={() => {
                              const updated = form.additions.filter(
                                (_, i) => i !== index
                              );
                              setForm({ ...form, additions: updated });
                            }}
                          />
                        </label>
                        <input
                          id={`addition_name_${index}`}
                          value={addition.name || ""}
                          onChange={(e) => {
                            const updated = [...form.additions];
                            updated[index].name = e.target.value;
                            setForm({ ...form, additions: updated });
                          }}
                        />
                        <label
                          htmlFor={`addition_price_${index}`}
                          className="subtitle"
                        >
                          preço
                        </label>
                        <input
                          id={`addition_price_${index}`}
                          type="number"
                          step="0.01"
                          value={addition.price || 0}
                          onChange={(e) => {
                            const updated = [...form.additions];
                            updated[index].price = parseFloat(e.target.value);
                            setForm({ ...form, additions: updated });
                          }}
                        />
                        {index < form.additions.length - 1 && (
                          <span className="separator" />
                        )}
                      </>
                    ))}
                  </div>
                </form>
              );
            case "item":
              return (
                <form onSubmit={(e) => _handleSubmit(e)}>
                  <label htmlFor="item_name" className="subtitle">
                    Nome do Item
                  </label>
                  <input
                    id="item_name"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <label htmlFor="item_price" className="subtitle">
                    Preço
                  </label>
                  <input
                    id="item_price"
                    type="number"
                    step="0.01"
                    onChange={(e) =>
                      setForm[{ ...form, price: e.target.value }]
                    }
                  />
                  <label htmlFor="item_ingredients" className="subtitle">
                    Ingredientes
                  </label>
                  <textarea
                    id="item_ingredients"
                    rows="4"
                    cols="50"
                    placeholder="Escreva os ingredients separados por vírgula aqui..."
                  ></textarea>
                </form>
              );
            default:
              setTimeout(() => setOpenModal(false), 0);
              break;
          }
        })()}
      </Modal>
    </div>
  );
}

export default Admin;
