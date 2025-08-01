import { useEffect, useState } from "react";
import Header from "../../components/header";
import api from "../../utils";
import Orders from "./tabs/orders";
import MenuControl from "./tabs/menuControl";
import Customize from "./tabs/customize";
import Graph from "./tabs/graph";
import { PiNewspaperClippingFill } from "react-icons/pi";
import { MdMenuBook } from "react-icons/md";
import { TbGraphFilled } from "react-icons/tb";
import Floater from "../../components/floater";
import { FaPause, FaPlay, FaStop } from "react-icons/fa6";
import { BiCustomize } from "react-icons/bi";

function Admin({ loading }) {
  const token = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState({});
  const [status, setStatus] = useState(false);

  useEffect(() => {
    loading(true);
    if (user.userId) {
      api.get(`/work_status?id=${user.userId}`).then((response) => {
        setStatus(response.data.data);
      });
      loading(false);
    }
  }, [user]);

  const switchStatus = async (status) => {
    try {
      loading(true);
      const response = await api.put(
        "/work_status",
        { id: user.userId, status: status },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus(response.data.data);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      loading(false);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        window.location.href = "/auth";
      } else {
        try {
          loading(true);
          const response = await api.post(
            "/verify_token.php",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.data.valid) {
            localStorage.removeItem("authToken");
            loading(false);
            window.location.href = "/auth";
          } else {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error("Erro ao verificar token:", error);
          localStorage.removeItem("authToken");
          loading(false);
          window.location.href = "/auth";
        } finally {
          loading(false);
        }
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="page" id="admin">
      <Header>
        <PiNewspaperClippingFill
          size={"2.5rem"}
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "active" : "inactive"}
        />
        <MdMenuBook
          size={"2.5rem"}
          onClick={() => setActiveTab("menu")}
          className={activeTab === "menu" ? "active" : "inactive"}
        />
        <BiCustomize
          size={"2.5rem"}
          onClick={() => setActiveTab("customize")}
          className={activeTab === "customize" ? "active" : "inactive"}
        />
        <TbGraphFilled
          size={"2.5rem"}
          onClick={() => setActiveTab("graph")}
          className={activeTab === "graph" ? "active" : "inactive"}
        />
      </Header>
      {activeTab === "orders" && (
        <Orders
          token={token}
          user={{ ...user, status: status }}
          loading={loading}
        />
      )}
      {activeTab === "menu" && <MenuControl token={token} loading={loading} />}
      {activeTab === "graph" && <Graph token={token} loading={loading} />}
      {activeTab === "customize" && (
        <Customize token={token} loading={loading} />
      )}

      <Floater className="control">
        <button
          disabled={status === "inactive"}
          onClick={() => switchStatus("inactive")}
          className={status === "inactive" ? "pressed" : ""}
        >
          <FaStop size={"2rem"} />
        </button>
        <button
          disabled={status === "paused"}
          onClick={() => switchStatus("paused")}
          className={status === "paused" ? "pressed" : ""}
        >
          <FaPause size={"2rem"} />
        </button>
        <button
          disabled={status === "active"}
          onClick={() => switchStatus("active")}
          className={status === "active" ? "pressed" : ""}
        >
          <FaPlay size={"2rem"} />
        </button>
      </Floater>
    </div>
  );
}

export default Admin;
