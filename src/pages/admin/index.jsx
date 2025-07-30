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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const defaultCategory = { name: "", additions: [] };
  const defaultAddition = {
    name: "",
    price: 0.0,
  };
  const defaultItem = {
    name: "",
    price: 0.0,
    ingredients: "",
  };

  const _openModal = (form, type) => {
    setOpenModal(true);
    setForm(form);
    setType(type);
  };

  const _handleDelete = async (id, category = null) => {
    try {
      if (category) {
        const updatedCategory = {
          ...category,
          items: category.items.map((item) =>
            item.id === id ? { ...item, status: "delete" } : item
          ),
        };

        const response = await axios.put(`${api}/menu`, updatedCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const updated = response.data.category;

        setCategories((prev) =>
          prev.map((cat) => (cat.id === updated.id ? updated : cat))
        );
      } else {
        await axios.delete(`${api}/menu?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      }
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
    setSelectedCategory(null);
  };

  const _handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedCategory) {
        let updatedCategory = { ...selectedCategory };

        if (type === "item") {
          const ingredients = form.ingredients
            .split(",")
            .map((ing) => ing.trim())
            .filter(Boolean);

          const itemData = {
            ...form,
            ingredients: ingredients,
          };

          if (form.id) {
            updatedCategory.items = updatedCategory.items.map((item) =>
              item.id === form.id ? itemData : item
            );
          } else {
            updatedCategory.items = [
              ...(updatedCategory.items || []),
              { ...itemData, status: "new" },
            ];
          }
        }

        const response = await axios.put(`${api}/menu`, updatedCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        updatedCategory = response.data.category;

        setCategories((prev) =>
          prev.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
        );
      } else {
        let newCategory = form;

        const response = await axios.post(`${api}/menu`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        newCategory = {
          ...form,
          id: response.data.categoryId,
          items: [],
        };

        setCategories((prev) => [...prev, newCategory]);
      }
      setSelectedCategory(null);
      setOpenModal(false);
      setForm({});
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/auth";
      } else {
        console.error(
          "Erro ao enviar categoria:",
          error.response?.data || error.message
        );
      }
    }
  };

  useEffect(() => {
    if (token) {
      try {
        axios.get(`${api}/menu`).then((response) => {
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
                    onClick={() => _handleDelete(category.id)}
                  />
                </Actions>
              </h2>
              <h2 className="subtitle action">
                Itens{" "}
                <FaCirclePlus
                  size={"1.5rem"}
                  onClick={() => {
                    setSelectedCategory(category);
                    _openModal(defaultItem, "item");
                  }}
                />
              </h2>
              {category.items.map((item) => (
                <div className="card" key={item.id}>
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
                      <FaTrash
                        size={"2rem"}
                        onClick={() => {
                          _handleDelete(item.id, category);
                        }}
                      />
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
                  <button>Salvar</button>
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
                      setForm({ ...form, price: e.target.value })
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
                    onChange={(e) =>
                      setForm({ ...form, ingredients: e.target.value })
                    }
                  ></textarea>
                  <button>Salvar</button>
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
