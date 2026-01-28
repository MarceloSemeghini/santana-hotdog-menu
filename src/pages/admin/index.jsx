import { useEffect, useState } from "react";
import Header from "../../components/header";
import api from "../../utils";
import Orders from "./tabs/orders";
import MenuControl from "./tabs/menuControl";
import Graph from "./tabs/graph";
import { PiNewspaperClippingFill } from "react-icons/pi";
import { MdMenuBook } from "react-icons/md";
import { TbGraphFilled } from "react-icons/tb";
import Floater from "../../components/floater";
import { FaPause, FaPlay, FaStop, FaTrash } from "react-icons/fa6";
import Popup from "../../components/popup";
import TrashBin from "../../components/trashBin";

function Admin({ loading }) {
  const [alertMessage, setAlertMessage] = useState("");

  const token = localStorage.getItem("authToken");
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState({});
  const [status, setStatus] = useState(false);
  const [openBin, setOpenBin] = useState(false)

  useEffect(() => {
    if (user.userId) {
      try {
        loading(true);
        api.get(`/work_status?id=${user.userId}`).then((response) => {
          setStatus(response.data.data);
        });
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || "Erro ao buscar dados",
        );
      } finally {
        loading(false);
      }
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
        },
      );
      setStatus(response.data.data);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao atualizar status:",
      );
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
            },
          );
          if (!response.data.valid) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth";
          } else {
            setUser(response.data.user);
          }
        } catch (error) {
          setAlertMessage(
            error.response?.data?.message || "Erro ao verificar token:",
            error,
          );
          localStorage.removeItem("authToken");
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
      <TrashBin
        open={openBin}
        close={() => setOpenBin(false)}
        token={token}
        setAlertMessage={(message) => setAlertMessage(message)}
        loading={loading}
      />
      <Floater className="control">
        {activeTab === "orders" && (
          <div className="bin-toggle" onClick={() => setOpenBin(true)}>
            <FaTrash size={"2rem"} />
          </div>
        )}
        <button
          disabled={status === "inactive"}
          onClick={() => switchStatus("inactive")}
        >
          <FaStop size={"2rem"} className={status === "inactive" ? "active" : "inactive"}/>
        </button>
        <button
          disabled={status === "paused"}
          onClick={() => switchStatus("paused")}
        >
          <FaPause size={"2rem"} className={status === "paused" ? "active" : "inactive"}/>
        </button>
        <button
          disabled={status === "active"}
          onClick={() => switchStatus("active")}
        >
          <FaPlay size={"2rem"} className={status === "active" ? "active" : "inactive"}/>
        </button>
      </Floater>
      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </div>
  );
}

export default Admin;
