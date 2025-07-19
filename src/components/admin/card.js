import CardItem from "./cardItem";

function Card({ category }) {
  return (
    <div className="card category">
      <span className="title">{category.name}</span>

      {category.additions && (
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
