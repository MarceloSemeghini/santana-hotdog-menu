import { useEffect, useState } from "react";
import Header from "../../components/header";
import api from "../../utils";
import PasswordInput from "../../components/passwordInput";
import Popup from "../../components/popup";

function Auth({ loading }) {
  const [alertMessage, setAlertMessage] = useState("");

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
        setAlertMessage(response.data.message || "Falha no login.");
      }
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "Erro ao fazer login");
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
            autoComplete="on"
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
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </div>
  );
}

export default Auth;
