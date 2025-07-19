import { useEffect, useState } from "react";
import Header from "../../components/header";
import axios from "axios";
import api from "../../config";
import Card from "../../components/admin/card";

function Admin() {
  const token = localStorage.getItem("authToken");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({
    name: "Doces",
  });

  const _HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/menu/categories`, category, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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
        <button onClick={_HandleSubmit}>teste</button>
        {categories.map((category) => (
          <Card category={category} key={category.id}/>
        ))}
      </div>
    </>
  );
}
export default Admin;
