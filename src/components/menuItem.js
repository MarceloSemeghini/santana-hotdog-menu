function MenuItem({ item }) {
    return (
        <div className="menu-card">
            <div className={`menu-item ${item.image ? 'has-image' : ''}`}>
                <h3 className="item-name">
                    {item.name}
                </h3>
                <ul className="item-ingredients">
                    {item.ingredients.map((ingredient, index) => (
                        <li key={index} className="ingredient-line">{ingredient}</li>
                    ))}
                </ul>
                {item.image && 
                    <figure className="item-image">
                        <img src={item.image} alt={item.name}/>
                    </figure>
                }
                <span className="item-price">
                    {item.price.toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export default MenuItem;
