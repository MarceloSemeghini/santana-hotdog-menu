import { useEffect, useState } from "react";
import Header from "../../components/header";
import api from "../../utils";
import PasswordInput from "../../components/passwordInput";

function Auth({ loading }) {
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState({ email: "", password: "" });

  useEffect(() => {
    token && (window.location.href = "/admin");
  }, [token]);

  const _HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      loading(true);
      const response = await api.post("/auth", {
        email: user.email,
        password: user.password,
      });

      if (response.data.status === "success") {
        const token = response.data.token;

        localStorage.setItem("authToken", token);
        loading(false);
        window.location.href = "/admin";
      } else {
        alert(response.data.message || "Falha no login.");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(error.response?.data?.message || "Erro ao fazer login");
    } finally {
      loading(false);
    }
  };

  return (
    <div className="page" id="auth">
      <Header />
      <div className="container">
        <form onSubmit={_HandleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            autocomplete="on"
            placeholder="email@exemplo.com"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <label htmlFor="password">Senha</label>
          <PasswordInput
            onChange={(value) => setUser({ ...user, password: value })}
          />

          <button type="submit">enviar</button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
