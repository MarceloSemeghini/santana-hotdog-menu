import { useEffect, useRef, useState } from "react";
import { FaCirclePlus, FaCopy, FaTrash } from "react-icons/fa6";
import { FaEdit, FaSave } from "react-icons/fa";
import api from "../../../utils";
import Actions from "../../../components/actions";
import Modal from "../../../components/modal";
import PriceInput from "../../../components/priceInput";
import Popup from "../../../components/popup";
import InfoManager from "../../../components/infoManager";

function MenuControl({ token, loading }) {
  const [popupMessage, setPopupMessage] = useState({ message: "", type: "" });
  const [openModal, setOpenModal] = useState(false);

  const fetchedRef = useRef(false);

  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [form, setForm] = useState({});
  const [type, setType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const defaultCategory = { name: "" };
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
        setCategories(
          response.data.data
            .filter((a) => a.name !== "info")
            .map((cat) => ({
              ...cat,
              items: cat.items || [],
              additions: cat.additions || [],
            })),
        );
      });
    } catch (error) {
      setPopupMessage({
        message: error.response?.data?.message || "Erro ao buscar os dados",
        type: "alert",
      });
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

    if (form.name === "") {
      setPopupMessage({
        message: "Preencha o formulário com um nome válido",
        type: "alert",
      });
      return;
    }

    const categoryData = forceData.name
      ? forceData
      : selectedCategory
        ? selectedCategory
        : form;
    let message = "Categoria atualizada com sucesso";

    if (type === "item") {
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

      if (form.id) {
        categoryData.items = categoryData.items.map((item) =>
          item.id === form.id ? itemData : item,
        );
        message = "Item alterado com sucesso";
      } else {
        categoryData.items = [
          ...(categoryData.items || []),
          { ...itemData, status: "new" },
        ];
        message = "Item criado com sucesso";
      }
    } else if (type === "addition") {
      const additions = categoryData.additions || [];

      const duplicated = additions.find(
        (addition) => addition.name === form.name,
      );
      if (duplicated && !form.originalName) {
        setPopupMessage({
          message: "Já existe uma adição com esse nome",
          type: "alert",
        });
        return;
      }

      const additionData = form;

      if (form.originalName) {
        categoryData.additions = additions.map((addition) =>
          addition.name === form.originalName ? additionData : addition,
        );
        message = "Adição alterada com sucesso";
      } else {
        categoryData.additions = [...additions, additionData];
        message = "Adição criada com sucesso";
      }
    }

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
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );

        setOpenModal(false);
        setPopupMessage({ message: message, type: "success" });
      } catch (error) {
        setPopupMessage({
          message:
            error.response?.data?.message ||
            "Houve algum erro ao tentar atualizar a categoria",
          type: "alert",
        });
      } finally {
        setSelectedCategory(null);
        loading(false);
      }
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

        setOpenModal(false);

        setCategories((prev) => [...prev, newCategory]);

        setPopupMessage({
          message: "Categoria criada com sucesso",
          type: "success",
        });
      } catch (error) {
        setPopupMessage({
          message:
            error.response?.data?.message ||
            "Houve algum erro ao tentar criar a categoria",
          type: "alert",
        });
      } finally {
        setSelectedCategory(null);
        loading(false);
      }
    }
  };

  const _handleDelete = async ({
    categoryId = null,
    itemId = null,
    additionName = null,
  }) => {
    if (categoryId && !itemId && !additionName) {
      try {
        await api.delete(`/menu?id=${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setCategories((prev) =>
          prev.filter((category) => category.id !== categoryId),
        );
      } catch (error) {
        setPopupMessage({
          message:
            error.response?.data?.message ||
            "Houve algum erro ao tentar deletar a categoria",
          type: "alert",
        });
      } finally {
        setSelectedCategory(null);
        loading(false);
      }
    }
    if (categoryId && itemId && !additionName) {
      const categoryData = categories.find(
        (category) => category.id === categoryId,
      );
      const updatedCategory = {
        ...categoryData,
        items: categoryData.items.map((item) =>
          item.id === itemId ? { ...item, status: "delete" } : item,
        ),
      };
      try {
        const response = await api.put("/menu", updatedCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setCategories((prev) =>
          prev.map((category) =>
            category.id === response.data.category.id
              ? response.data.category
              : category,
          ),
        );
      } catch (error) {
        setPopupMessage({
          message:
            error.response?.data?.message ||
            "Houve algum erro ao tentar deletar o item",
          type: "alert",
        });
      } finally {
        setSelectedCategory(null);
        loading(false);
      }
    } else if (categoryId && !itemId && additionName) {
      const categoryData = categories.find((a) => a.id === categoryId);
      const updatedCategory = {
        ...categoryData,
        additions: categoryData.additions.filter(
          (addition) => addition.name !== additionName,
        ),
      };

      const response = await api.put("/menu", updatedCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCategories((prev) =>
        prev.map((category) =>
          category.id === response.data.category.id
            ? response.data.category
            : category,
        ),
      );
    }
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
                    onClick={() => _handleDelete({ categoryId: category.id })}
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
                    <span className="price">R${item.price}</span>
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
                          _handleDelete({
                            categoryId: category.id,
                            itemId: item.id,
                          });
                        }}
                      />
                    </Actions>
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
                                "addition",
                              );
                            }}
                          />
                          <FaTrash
                            className="icon-action"
                            size={"1.5rem"}
                            onClick={() =>
                              _handleDelete({
                                categoryId: category.id,
                                additionName: addition.name,
                              })
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
        {pageInfo && <InfoManager data={pageInfo} setData={setPageInfo} />}
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
              value={parseFloat(form.price) || 0}
              onChange={(val) => setForm({ ...form, price: parseFloat(val) })}
            />
            <button>Salvar</button>
          </form>
        )}
      </Modal>
      <Popup
        message={popupMessage.message}
        onClose={() => setPopupMessage({ message: "", type: "" })}
        type={popupMessage.type}
      />
    </>
  );
}

export default MenuControl;
