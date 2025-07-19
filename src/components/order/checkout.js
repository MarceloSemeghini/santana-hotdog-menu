import { IoMdCloseCircle } from "react-icons/io";

function Checkout({ list, removeItem }) {
    return (
        <div className="checkout">
            <span className="title">Carrinho</span>

            {list.map((item, index) => (
                <div key={item.id} className="item-wrapper">
                    <li className="cart-item">
                        <div className="item-header">
                            {item.name} <span>- {item.price.toFixed(2)}</span>
                            <IoMdCloseCircle size={24} onClick={() => removeItem(index)} className="remove"/>
                        </div>
                        {item.additions && item.additions.length > 0 && 
                            <div className="item-bottom">
                                {item.additions.map((addition, index) => 
                                    <span className="item-extra" key={addition.id}>
                                        <strong>{addition.name}</strong>{index + 1 < item.additions.length ? index + 2 < item.additions.length ? ", " : " e " : "."}
                                    </span>
                                )}
                            </div>
                        }
                    </li>
                </div>
            ))}

            <span className="checkout-extra">
                Adicional
                <p>Nós permitimos o acréscimo de bacon, queijo ....</p>
                <input type="text" />
            </span>

            <span className="cart-summary">
                Total: R${" "}
                {list.reduce((acc, item) => {
                    const price = parseFloat(item.price) || 0;
                    const qty = item.quantity || 1;
                    return acc + price * qty;
                }, 0).toFixed(2)}
            </span>

            <span className="name-input subtitle">
                Nome
                <input type="text" id="name" />
            </span>

            <button>Finalizar</button>
        </div>
    );
}

export default Checkout;
