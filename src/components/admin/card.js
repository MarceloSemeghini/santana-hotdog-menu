import { FaTrash } from "react-icons/fa6";
import CardItem from "./cardItem";

function Card({ category, delete: onDelete }) {
  return (
    <div className="card category">
      <span className="title">{category.name}</span>
      <FaTrash onClick={onDelete}/>

      <span className="subtitle">Items</span>
      {category.additions && category.additions.length > 0 && (
        <>
          <span className="subtitle">Adições Disponíveis</span>
          {category.additions.map((addition) => (
            <CardItem addition={addition} key={addition.name} />
          ))}
        </>
      )}
    </div>
  );
}

export default Card;
