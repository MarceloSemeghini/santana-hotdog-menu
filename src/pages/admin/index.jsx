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
  const defaultCategory = { name: "", additions: [] };
  const defaultItem = { name: "", price: 99.99, ingredients: [], category_id: 0};

  const _handleDeleteCategory = async (id) => {
    try {
      const response = await axios.delete(`${api}/menu/categories?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
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
  };

  const _handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/menu/categories`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
    } catch (error) {
      if (error.response && error.response.status === 401) {
      } else {
        console.error(
          "Erro ao criar categoria:",
          error.response?.data || error.message
        );
      }
    }
  };

  console.log(form);

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
        <bold className="title action">
          Categorias{" "}
          <FaCirclePlus
            size={"2rem"}
            onClick={() => (setOpenModal(true), setForm(defaultCategory))}
          />
        </bold>
        {categories &&
          categories.map((category) => (
            <div className="section">
              <h2 className="title action">
                {category.name}
                <Actions>
                  <FaEdit size={"2rem"} />
                  <FaCopy size={"2rem"} />
                  <FaTrash
                    size={"2rem"}
                    onClick={() => _handleDeleteCategory(category.id)}
                  />
                </Actions>
              </h2>
              <h2 className="subtitle action">
                Itens <FaCirclePlus size={"1.5rem"} />
              </h2>
              {category.items.map((item) => (
                <div className="card">
                  <div className="card-content">
                    <h3 className="subtitle">{item.name} </h3>
                    <div className="list">
                      {item.ingredients &&
                        item.ingredients.map((ingredient, index) => (
                          <span className="content item">{ingredient}</span>
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
              <h2 className="subtitle action">
                Adições <FaCirclePlus size={"1.5rem"} />
              </h2>
              {category.additions.length > 0 && (
                <div className="card">
                  <div className="card-content list">
                    {category.additions.map((addition) => (
                      <p className="content item">{addition.name} R${addition.price.toFixed(2)}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
      <Modal active={openModal} close={() => setOpenModal(false)}>
        <form onSubmit={_handleSubmitCategory}>
          <input onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}

export default Admin;
