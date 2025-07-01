import { useState } from "react";

function MenuItem({ item, handleCart, additions }) {
    const [selected, setSelected] = useState(false);
    const [selectedAdditions, setSelectedAdditions] = useState([]);

    const toggleAddition = (addition) => {
        setSelectedAdditions((prev) => {
            const exists = prev.find(a => a.name === addition.name);
            if (exists) {
                return prev.filter(a => a.name !== addition.name);
            } else {
                return [...prev, addition];
            }
        });
    };

    const getTotalPrice = () => {
        const additionsTotal = selectedAdditions.reduce((sum, add) => sum + add.price, 0);
        return item.price + additionsTotal;
    };

    const handleConfirm = () => {
        const updatedItem = {
            ...item,
            additions: selectedAdditions,
            price: getTotalPrice()
        };
        handleCart(updatedItem);
        setSelected(false);
        setSelectedAdditions([]);
    };

    return (
        <div className={`menu-card${selected ? " selected" : ""}`}>
            <div className={`menu-item${item.image ? ' has-image' : ''}${item.ingredients.length !== 0 ? ' has-ingredients' : ''}`}>
                <h3 className="item-name">
                    {item.name}
                </h3>
                {item.image && 
                    <figure className="item-image">
                        <img src={item.image} alt={item.name}/>
                    </figure>
                }
                {item.ingredients.length > 0 &&
                    <ul className="item-ingredients">
                        {item.ingredients.map((ingredient, index) => (
                            <li key={index} className="ingredient-line">{ingredient}</li>
                        ))}
                    </ul>
                }
                {additions.length > 0 ? (
                    !selected ? (
                        <div className="wrapper-box">
                            <div className="button-wrapper">
                                <span className="item-price">{item.price.toFixed(2)}</span>
                                <button className="add-item" onClick={() => setSelected(true)}>adicionar</button>
                            </div>
                        </div>
                    ) : (
                        <>
                        <div className="aditionals"> 
                            <span>Adicionais</span>
                            <ul>
                                {additions.map((addition, index) => (
                                    <li key={index}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedAdditions.includes(addition)}
                                                onChange={() => toggleAddition(addition)}
                                            />
                                            <span>{addition.price.toFixed(2)}</span> {addition.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div> 
                        <div className="confirm-wrapper">
                            <div className="button-wrapper">
                                <span className="item-price">{getTotalPrice().toFixed(2)}</span>
                                <button className="confirm" onClick={handleConfirm}>
                                    confirmar
                                </button>
                            </div>
                        </div>
                        </>
                    )
                ) : (
                    <div className="wrapper-box">
                        <div className="button-wrapper">
                            <span className="item-price">{item.price.toFixed(2)}</span>
                            <button className="add-item" onClick={() => handleCart(item)}>
                                adicionar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MenuItem;
