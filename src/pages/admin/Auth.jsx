import { useEffect, useState } from "react";
import Header from "../../components/header";
import axios from "axios";
import api from "../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function Auth() {
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    token && (window.location.href = "/admin");
  }, [token])

  const _HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/auth`, {
        email: user.email,
        password: user.password,
      });

      if (response.data.status === "success") {
        const token = response.data.token;

        localStorage.setItem("authToken", token);
        window.location.href = "/admin";
      } else {
        alert(response.data.message || "Falha no login.");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(error.response?.data?.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="page" id="auth">
      <Header />
      <div className="container">
        <form onSubmit={_HandleSubmit}>
          <label for="email">Email</label>
          <input
            type="text"
            id="email"
            autocomplete="on"
            placeholder="email@exemplo.com"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <label for="password">Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="******"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button
              type="button"
              className="icon floating"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit">enviar</button>
        </form>
      </div>
    </div>
  );
}

export default Auth;