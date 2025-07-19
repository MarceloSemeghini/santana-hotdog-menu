import { useState } from "react";
import Header from "../../components/header";
import axios from "axios";
import api from "../../config";

function Auth() {
  const [user, setUser] = useState({ email: "", password: "" });

  const _HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api}/auth`, {
        email: user.email,
        password: user.password
      });

      if (response.data.status === "success") {
        const token = response.data.token;

        localStorage.setItem("authToken", token);

        window.location.href = "/admin";
      } else {
      alert(response.data.message || "Falha no login.");
    }
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  return (
    <>
      <Header/>
      <div className="auth page">
        <form onSubmit={_HandleSubmit}>
          <label>Email</label>
          <input
            type="text"
            placeholder="email@exemplo.com"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
          <label>Senha</label>
          <input
            type="text"
            placeholder="654321"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
          <button type="submit">enviar</button>
        </form>
      </div>
    </>
  );
}
export default Auth;
