import { SiTorbrowser } from "react-icons/si";


function Orders({ token, user, loading }) {
  return (
    <div className="container" style={{ alignItems: "center" }}>
      <div className="action">
        <b className="title">Pedidos </b>
        <SiTorbrowser size={"2rem"} className={`status ${user.status}`}/>
      </div>
    </div>
  );
}

export default Orders;
