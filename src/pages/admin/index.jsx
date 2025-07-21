import { useEffect, useState } from "react";
import Header from "../../components/header";
import axios from "axios";
import api from "../../config";
import Card from "../../components/admin/card";
import { FaCirclePlus } from "react-icons/fa6";

function Admin() {
  const token = localStorage.getItem("authToken");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ name: "", additions: [] });

  const _HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/menu/categories`, category, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = "/auth";
      } else {
        console.error(
          "Erro ao criar categoria:",
          error.response?.data || error.message
        );
      }
    }
  };

  const _HandleDelete = async (id) => {
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
        window.location.href = "/auth";
      } else {
        console.error(
          "Erro ao deletar categoria:",
          error.response?.data || error.message
        );
      }
    }
  };

  useEffect(() => {
    if (token) {
      axios.get(`${api}/menu/categories`).then((response) => {
        setCategories(response.data.data);
      });
    } else {
      window.location.href = "/auth";
    }
  }, [token]);

  return (
    <>
      <Header></Header>
      <div className="admin page">
        <div className="content-wrapper">
          <button onClick={_HandleSubmit} className="icon">
            <FaCirclePlus size={"2rem"} />
          </button>
          {categories.map((category) => (
            <Card
              category={category}
              delete={() => _HandleDelete(category.id)}
              key={category.id}
            />
          ))}
        </div>
      </div>
      <div className="pop-up">
        <form onSubmit={_HandleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
          />
          <button>enviar</button>
        </form>
      </div>
    </>
  );
}
export default Admin;
