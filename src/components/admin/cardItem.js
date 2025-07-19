import { FaGears } from "react-icons/fa6";

function CardItem({ addition }) {
  return (
    <div className="item">
      <h3 className="item-name">{addition.name}</h3>
      <button className="icon">
        <FaGears size={"2rem"}/>
      </button>
    </div>
  );
}

export default CardItem;
