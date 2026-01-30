import { useState } from "react";
import api from "../../../utils";
import Popup from "../../../components/popup";
import { FaSearch } from "react-icons/fa";

function Graph({ token, loading }) {
  const [alertMessage, setAlertMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analyticsData, setAnalyticsData] = useState({});

  const fetchOrders = async () => {
    if (!token) return;

    if (!startDate || !endDate) {
      setAlertMessage("Por favor, selecione ambas as datas.");
      return;
    }

    try {
      loading(true);

      const response = await api.get("/analytics", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalyticsData(response.data?.data || []);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Erro ao buscar analytics",
      );
    } finally {
      loading(false);
    }
  };

  function formatDateBR(dateString) {
    if (typeof dateString !== "string") return "";

    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  return (
    <>
      <div className="container" id="graph">
        <b className="title">Painel de Desempenho</b>

        <div className="search-wrapper card">
          <div className="date-select-wrapper">
            <div>
              <span>Data inicial</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <span>Data final</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <FaSearch
            size={"2.5rem"}
            className={startDate && endDate ? "active" : "inactive"}
            onClick={() => fetchOrders()}
          />
        </div>

        {analyticsData.total !== undefined && (
          <>
            {analyticsData.weekly.length > 1 && (
              <div className="data-item card">
                <p>
                  Total de do período:{" "}
                  <b>R${analyticsData?.total.toFixed(2).replace(".", ",")}</b>
                </p>
              </div>
            )}
            {analyticsData?.weekly &&
              analyticsData.weekly.map((week) => (
                <div className="card">
                  <div className="card-content">
                    <span className="title">
                      Semana {analyticsData.weekly.length > 1 && week.week}
                    </span>
                    <p>
                      Total da Semana:
                      <b>R${week?.total.toFixed(2).replace(".", ",")}</b>
                    </p>

                    {week?.days &&
                      week?.days.map((day) => (
                        <>
                          <span className="separator" />
                          <p>
                            {formatDateBR(day?.date)}:
                            <b>R${day?.total.toFixed(2).replace(".", ",")}</b>
                          </p>
                        </>
                      ))}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

      <Popup
        message={alertMessage}
        onClose={() => setAlertMessage("")}
        type="alert"
      />
    </>
  );
}

export default Graph;
