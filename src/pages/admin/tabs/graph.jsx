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

  return (
    <>
      <div className="container" id="graph">
        <b className="title">Painel de Desempenho</b>

        <div className="search-wrapper">
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

        <div>
          {analyticsData.total !== undefined && (
            <div className="analytics-data">
              <div className="data-item">
                <p>Total de do período<b>{analyticsData.total}</b></p>
                
              </div>
              <br/>
              {analyticsData?.weekly &&
                analyticsData.weekly.map((week) => (
                  <>
                    <span>Semana {week.week}<b>{week?.total}</b></span>
                    
                    {week?.days &&
                      week?.days.map((day) => (
                        <p>
                          {day?.date}
                          <b>{day?.total}</b>
                        </p>
                      ))}
                      <br/>
                  </>
                ))}
            </div>
          )}
        </div>
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
