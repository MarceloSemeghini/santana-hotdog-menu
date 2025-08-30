import { useEffect, useRef, useState } from "react";
import { FaCirclePlus, FaCopy, FaTrash } from "react-icons/fa6";
import { FaEdit, FaSave } from "react-icons/fa";
import api from "../../../utils";
import Actions from "../../../components/actions";
import Modal from "../../../components/modal";
import PriceInput from "../../../components/priceInput";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import Popup from "../../../components/popup";

function MenuControl({ token, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const fetchedRef = useRef(false);

  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
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
    ingredients: [],
  };

  useEffect(() => {
    if (!token || fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      loading(true);
      api.get("/menu").then(async (response) => {
        let info = response.data.data.find((a) => a.name === "info");

        if (!info) {
          const defaultInfo = {
            name: "info",
            additions: {
              pauseWarning: "",
              innactiveWarning: "",
              workingHours: {
                monday: "",
                tuesday: "",
                wednesday: "",
                thursday: "",
                friday: "",
                saturday: "",
                sunday: "",
              },
              vacation: false,
              vacationWarning: "",
            },
          };
          const responsePost = await api.post("/menu", defaultInfo, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          info = responsePost.data.category ?? {
            ...defaultInfo,
            id: responsePost.data.categoryId,
          };
        }

        setPageInfo(info);
        setCategories(response.data.data.filter((a) => a.name !== "info"));
      });
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar o cardápio"
      );
    } finally {
      loading(false);
    }
  }, [token]);

  const _openModal = (form, type) => {
    setOpenModal(true);
    setForm(form);
    setType(type);
  };

  const _handleSubmit = async (e, forceData = {}) => {
    e.preventDefault();

    //Submit without modal interaction needs to recieve data directly

    //Basic verification before trying backend comunication
    if (form.name === "") {
      setAlertMessage("Preencha o formulário com um nome válido");
      return;
    }

    //if there is not a selected category, form will be the category itself
    const categoryData = selectedCategory
      ? selectedCategory
      : forceData.name
      ? forceData
      : form;

    if (type === "item") {
      //ingredients treatment
      const ingredients = Array.isArray(form.ingredients)
        ? form.ingredients
        : form.ingredients
            .split(",")
            .map((ing) => ing.trim())
            .filter(Boolean);

      const itemData = {
        ...form,
        ingredients: ingredients,
      };

      //verify if item already exists
      if (form.id) {
        categoryData.items = categoryData.items.map((item) =>
          item.id === form.id ? itemData : item
        );
      } else {
        categoryData.items = [
          ...(categoryData.items || []),
          { ...itemData, status: "new" },
        ];
      }
    } else if (type === "addition") {
      //verify if the name will be a duplicate
      const duplicated = categoryData.additions.find(
        (addition) => addition.name === form.name
      );
      if (duplicated) {
        setAlertMessage("Já existe uma adição com esse nome");
        return
      }
      const additionData = form;

      //verifying if addition already exists by its name and using originalName instead of ID
      const exists = categoryData.additions.find(
        (addition) => addition.name === form.originalName
      );

      if (exists) {
        categoryData.additions = categoryData.additions.map((addition) =>
          addition.name === form.originalName ? additionData : addition
        );
      } else {
        categoryData.additions = [
          ...(categoryData.additions || []),
          additionData,
        ];
      }
    }

    //if it has ID the category exists and will be updates
    if (categoryData.id) {
      try {
        loading(true);
        const response = await api.put("/menu", categoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const updatedCategory = response.data.category;

        setCategories((prev) =>
          prev.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
        );
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message ||
            "Houve algum erro ao tentar atualizar a categoria"
        );
      } finally {
        setOpenModal(false);
        loading(false);
      }
      //if it doesn't have ID it will be created
    } else {
      try {
        loading(true);
        const response = await api.post("/menu", form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const newCategory = {
          ...form,
          id: response.data.categoryId,
          items: [],
        };

        setCategories((prev) => [...prev, newCategory]);
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message ||
            "Houve algum erro ao tentar criar a categoria"
        );
      } finally {
        setOpenModal(false);
        loading(false);
      }
    }
  };

  const _handleDelete = async (id, category = null) => {
    try {
      loading(true);
      if (category) {
        const updatedCategory = {
          ...category,
          items: category.items.map((item) =>
            item.id === id ? { ...item, status: "delete" } : item
          ),
        };

        const response = await api.put("/menu", updatedCategory, {
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
        await api.delete(`/menu?id=${id}`, {
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
        loading(false);
        window.location.href = "/auth";
      } else {
        setAlertMessage(
          "Erro ao deletar categoria:",
          error.response?.data || error.message
        );
      }
    } finally {
      setSelectedCategory(null);
      loading(false);
    }
  };

  const _handleDeleteAddition = async (name, category) => {
    loading(true);
    try {
      const updatedCategory = {
        ...category,
        additions: category.additions.filter((a) => a.name !== name),
      };

      const response = await api.put("/menu", updatedCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const updated = response.data.category;

      setCategories((prev) =>
        prev.map((cat) => (cat.id === updated.id ? updated : cat))
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/auth";
      } else {
        setAlertMessage(
          "Erro ao deletar adição:",
          error.response?.data || error.message
        );
      }
    }
    setSelectedCategory(null);
    loading(false);
  };

  return (
    <>
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
              <span className="title action">
                {category.name}
                <Actions size={"2.5rem"}>
                  <FaEdit
                    size={"2rem"}
                    onClick={() => _openModal(category, "category")}
                  />
                  <FaCopy
                    size={"2rem"}
                    onClick={() => {
                      const copiedCategory = { ...category };
                      delete copiedCategory.id;
                      _openModal(copiedCategory, "category");
                    }}
                  />
                  <FaTrash
                    size={"2rem"}
                    onClick={() => _handleDelete(category.id)}
                  />
                </Actions>
              </span>
              <span className="subtitle action">
                Itens{" "}
                <FaCirclePlus
                  size={"1.5rem"}
                  onClick={() => {
                    setSelectedCategory(category);
                    _openModal(defaultItem, "item");
                  }}
                />
              </span>
              {category.items.map((item) => (
                <div className="card" key={item.id}>
                  <div className="card-content">
                    <span className="subtitle">{item.name} </span>
                    <div className="list">
                      {Array.isArray(item.ingredients) &&
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
                    <Actions size={"2rem"}>
                      <FaEdit
                        size={"1.5rem"}
                        onClick={() => {
                          setSelectedCategory(category);
                          _openModal(item, "item");
                        }}
                      />
                      <FaCopy
                        size={"1.5rem"}
                        onClick={() => {
                          const copiedItem = { ...item };
                          delete copiedItem.id;
                          setSelectedCategory(category);
                          _openModal(copiedItem, "item");
                        }}
                      />
                      <FaTrash
                        size={"1.5rem"}
                        onClick={() => {
                          _handleDelete(item.id, category);
                        }}
                      />
                    </Actions>
                    <span className="price">R${item.price}</span>
                  </div>
                </div>
              ))}
              <span className="subtitle action">
                Adições{" "}
                <FaCirclePlus
                  size={"1.5rem"}
                  onClick={() => {
                    setSelectedCategory(category);
                    _openModal(defaultAddition, "addition");
                  }}
                />
              </span>
              {category.additions?.length > 0 && (
                <div className="card">
                  <div className="card-content list">
                    {category.additions.map((addition, index) => (
                      <span
                        className="content item"
                        key={addition.name + index}
                      >
                        {addition.name} R${addition.price.toFixed(2)}
                        <Actions size={"1.5rem"}>
                          <FaEdit
                            className="icon-action"
                            size={"1.5rem"}
                            onClick={() => {
                              setSelectedCategory(category);
                              _openModal(
                                {
                                  ...addition,
                                  originalName: addition.name,
                                },
                                "addition"
                              );
                            }}
                          />
                          <FaTrash
                            className="icon-action"
                            size={"1.5rem"}
                            onClick={() =>
                              _handleDeleteAddition(addition.name, category)
                            }
                          />
                        </Actions>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

        <span className="separator" />

        <b className="title action">
          Informações{" "}
          <FaSave size={"2rem"} onClick={(e) => _handleSubmit(e, pageInfo)} />
        </b>
        {pageInfo && (
          <div className="card info">
            <div className="card-content">
              <label className="subtitle">Inativo</label>
              <textarea
                rows="4"
                cols="30"
                placeholder="Escreva aqui a mensagem que irá aparecer quando o os pedidos não estiverem sendo recebidos"
                value={pageInfo.additions?.innactiveWarning || ""}
                onChange={(e) =>
                  setPageInfo({
                    ...pageInfo,
                    additions: {
                      ...pageInfo.additions,
                      innactiveWarning: e.target.value,
                    },
                  })
                }
              />
              <label className="subtitle">Em pausa</label>
              <textarea
                rows="4"
                cols="30"
                placeholder="Escreva aqui a mensagem que irá aparecer quando o os pedidos estiverem pausados"
                value={pageInfo.additions?.pauseWarning || ""}
                onChange={(e) =>
                  setPageInfo({
                    ...pageInfo,
                    additions: {
                      ...pageInfo.additions,
                      pauseWarning: e.target.value,
                    },
                  })
                }
              />
              <ul>
                {[
                  { key: "monday", label: "segunda" },
                  { key: "tuesday", label: "terça" },
                  { key: "wednesday", label: "quarta" },
                  { key: "thursday", label: "quinta" },
                  { key: "friday", label: "sexta" },
                  { key: "saturday", label: "sábado" },
                  { key: "sunday", label: "domingo" },
                ].map(({ key, label }) => (
                  <li key={key}>
                    <label className="subtitle">{label}</label>
                    <input
                      value={pageInfo.additions?.workingHours?.[key] || ""}
                      onChange={(e) =>
                        setPageInfo((prev) => ({
                          ...prev,
                          additions: {
                            ...prev.additions,
                            workingHours: {
                              ...prev.additions.workingHours,
                              [key]: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
              <label
                className="subtitle action"
                onClick={() =>
                  setPageInfo((prev) => ({
                    ...prev,
                    additions: {
                      ...prev.additions,
                      vacation: !prev.additions.vacation,
                    },
                  }))
                }
              >
                Férias{" "}
                <span>
                  {pageInfo.additions?.vacation ? (
                    <ImCheckboxChecked />
                  ) : (
                    <ImCheckboxUnchecked />
                  )}{" "}
                </span>
              </label>
              <label className="subtitle">De férias</label>
              <textarea
                rows="4"
                cols="30"
                placeholder="Escreva aqui a mensagem que irá aparecer quando estiver de férias"
                value={pageInfo.additions?.vacationWarning || ""}
                onChange={(e) =>
                  setPageInfo({
                    ...pageInfo,
                    additions: {
                      ...pageInfo.additions,
                      vacationWarning: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
      <Modal active={openModal} close={() => setOpenModal(false)}>
        {type === "category" && (
          <form onSubmit={(e) => _handleSubmit(e)}>
            <label htmlFor="category_name" className="subtitle">
              Nome da Categoria
            </label>
            <input
              id="category_name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <button>Salvar</button>
          </form>
        )}
        {type === "item" && (
          <form onSubmit={(e) => _handleSubmit(e)}>
            <label htmlFor="item_name" className="subtitle">
              Nome do Item
            </label>
            <input
              id="item_name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label htmlFor="item_price" className="subtitle">
              Preço
            </label>
            <PriceInput
              value={parseFloat(form.price) || 0}
              onChange={(val) => setForm({ ...form, price: parseFloat(val) })}
            />
            <label htmlFor="item_ingredients" className="subtitle">
              Ingredientes
            </label>
            <textarea
              id="item_ingredients"
              rows="4"
              cols="50"
              placeholder="Escreva os ingredients separados por vírgula aqui..."
              value={
                Array.isArray(form.ingredients)
                  ? form.ingredients.join(", ")
                  : form.ingredients || ""
              }
              onChange={(e) =>
                setForm({ ...form, ingredients: e.target.value })
              }
            />
            <button>Salvar</button>
          </form>
        )}
        {type === "addition" && (
          <form onSubmit={(e) => _handleSubmit(e)}>
            <label htmlFor="item_name" className="subtitle">
              Qual a adição
            </label>
            <input
              id="item_name"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label htmlFor="item_price" className="subtitle">
              Preço
            </label>
            <PriceInput
              value={parseFloat(form.price)}
              onChange={(val) => setForm({ ...form, price: parseFloat(val) })}
            />
            <button>Salvar</button>
          </form>
        )}
      </Modal>
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </>
  );
}

export default MenuControl;
