import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";

function InfoManager({ data, setData }) {
  return (
    <div className="card info">
      <div className="card-content">
        <label className="subtitle">Inativo</label>
        <textarea
          rows="4"
          cols="30"
          placeholder="Escreva aqui a mensagem que irá aparecer quando o os pedidos não estiverem sendo recebidos"
          value={data.additions?.innactiveWarning || ""}
          onChange={(e) =>
            setData({
              ...data,
              additions: {
                ...data.additions,
                innactiveWarning: e.target.value,
              },
            })
          }
        />
        <label className="subtitle">Em pausa</label>
        <textarea
          rows="4"
          cols="30"
          placeholder="Escreva aqui a mensagem que irá aparecer quando o os pedidos estiverem pausados"
          value={data.additions?.pauseWarning || ""}
          onChange={(e) =>
            setData({
              ...data,
              additions: {
                ...data.additions,
                pauseWarning: e.target.value,
              },
            })
          }
        />
        <ul>
          {[
            { key: "monday", label: "segunda" },
            { key: "tuesday", label: "terça" },
            { key: "wednesday", label: "quarta" },
            { key: "thursday", label: "quinta" },
            { key: "friday", label: "sexta" },
            { key: "saturday", label: "sábado" },
            { key: "sunday", label: "domingo" },
          ].map(({ key, label }) => (
            <li key={key}>
              <label className="subtitle">{label}</label>
              <input
                value={data.additions?.workingHours?.[key] || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    additions: {
                      ...prev.additions,
                      workingHours: {
                        ...prev.additions.workingHours,
                        [key]: e.target.value,
                      },
                    },
                  }))
                }
              />
            </li>
          ))}
        </ul>
        <label
          className="subtitle action"
          onClick={() =>
            setData((prev) => ({
              ...prev,
              additions: {
                ...prev.additions,
                vacation: !prev.additions.vacation,
              },
            }))
          }
        >
          Férias{" "}
          <span>
            {data.additions?.vacation ? (
              <ImCheckboxChecked />
            ) : (
              <ImCheckboxUnchecked />
            )}{" "}
          </span>
        </label>
        <label className="subtitle">De férias</label>
        <textarea
          rows="4"
          cols="30"
          placeholder="Escreva aqui a mensagem que irá aparecer quando estiver de férias"
          value={data.additions?.vacationWarning || ""}
          onChange={(e) =>
            setData({
              ...data,
              additions: {
                ...data.additions,
                vacationWarning: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
}

export default InfoManager;
