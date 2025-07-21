import { useState } from "react";
import Header from "../../components/header";
import axios from "axios";
import api from "../../config";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function Auth() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

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
    <>
      <Header />
      <div className="auth page">
        <form onSubmit={_HandleSubmit}>
          <label>Email</label>
          <input
            type="text"
            placeholder="email@exemplo.com"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <label>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
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
    </>
  );
}

export default Auth;
