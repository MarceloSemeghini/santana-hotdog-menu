import { useEffect, useState } from "react";
import Header from "../components/header";
import axios from "axios";
import api from "../config";

function Home() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    try {
      axios.get(`${api}/menu.php`).then((response) => {
        setCategories(response.data.data);
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(error.response?.data?.message || "Erro ao fazer login");
    }
  }, []);

  return (
    <div className="page" id="home">
      <Header></Header>
      <div className="container">
        {categories &&
          categories.map(
            (category) =>
              category.items.length > 0 && (
                <div className="section">
                  <h2 className="title">{category.name}</h2>
                  {category.items.map((item) => (
                    <div className="card">
                      <div className="card-content">
                        <h3 className="subtitle">{item.name}</h3>
                        {item.ingredients && (
                          <span className="content">
                            {item.ingredients.map((ingredient, index) =>
                              index === 0
                                ? ingredient.charAt(0).toUpperCase() +
                                  ingredient.slice(1) +
                                  ", "
                                : item.ingredients.length === index + 2
                                ? `${ingredient} e `
                                : item.ingredients.length === index + 1
                                ? ` ${ingredient}.`
                                : `${ingredient}, `
                            )}
                          </span>
                        )}
                      </div>
                      <div className="card-actions">
                        <span className="price">
                          {parseFloat(item.price).toFixed(2)}
                        </span>
                        <button>Adicionar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}
      </div>
    </div>
  );
}

export default Home;
