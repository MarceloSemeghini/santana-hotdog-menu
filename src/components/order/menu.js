import { useEffect } from "react";
import MenuItem from "./menuItem";
import Floater from "../floater";

function Menu({list, setList, categories}) {

    function handleCart(item) {
        setList(prev => {
            const updatedList = [...prev, item];
            localStorage.setItem('cart', JSON.stringify(updatedList));
            return updatedList;
        })
    }


    useEffect(() => {
        const checkout = document.getElementById("summary");
        const secondary = document.getElementById("floating-summary");

        if (checkout && secondary) {
            secondary.innerHTML = checkout.innerHTML;
        }
    }, [list]);

    const menuAditions = [
        {
            id: 1,
            category: "Lanches",
            name: "extra bacon",
            price: 7.00
        },
        {
            id: 2,
            category: "Lanches",
            name: "extra cheddar",
            price: 4.00
        },
        {
            id: 3,
            category: "Lanches",
            name: "extra cebola",
            price: 3.00
        },
    ]

    const menuItems = [
        {
            id: 1,
            category: "Lanches",
            name: "Cachorro-Quente Simples",
            ingredients: ["Pão", "Salsicha", "Molho de Tomate"],
            price: 8.50,
        },
        {
            id: 2,
            category: "Lanches",
            name: "Cachorro-Quente com Queijo",
            ingredients: ["Pão", "Salsicha", "Queijo", "Molho de Tomate"],
            price: 10.00,
        },
        {
            id: 3,
            category: "Lanches",
            name: "Cachorro-Quente Especial",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar"],
            price: 12.00,
        },
        {
            id: 4,
            category: "Lanches",
            name: "Cachorro-Quente com Bacon",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar", "Bacon"],
            price: 12.00,
        },
        {
            id: 5,
            category: "Lanches",
            name: "Cachorro-Quente Simples",
            ingredients: ["Pão", "Salsicha", "Molho de Tomate"],
            price: 8.50,
        },
        {
            id: 6,
            category: "Lanches",
            name: "Cachorro-Quente com Queijo",
            ingredients: ["Pão", "Salsicha", "Queijo", "Molho de Tomate"],
            price: 10.00,
        },
        {
            id: 7,
            category: "Lanches",
            name: "Cachorro-Quente Especial",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar"],
            price: 12.00,
        },
        {
            id: 8,
            category: "Lanches",
            name: "Cachorro-Quente com Bacon",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar", "Bacon"],
            price: 12.00,
        },
        {
            id: 9,
            category: "Bebidas",
            name: "Cola-Cola",
            ingredients: [],
            price: 9.00,
        },
        {
            id: 10,
            category: "Bebidas",
            name: "Sprite",
            ingredients: [],
            price: 7.00,
        },
        {
            id: 11,
            category: "Doces",
            name: "Kit-Kat",
            ingredients: [],
            price: 7.00,
        },
        {
            id: 12,
            category: "Doces",
            name: "Snickers",
            ingredients: [],
            price: 7.00,
        },
    ];

    return (
        <div className="menu">
            {categories.map((category) => {
                const additions = menuAditions.filter(adition => adition.category === category.name);
                return (
                    <div key={category.id} className="category">
                        <span className="title" data-key={category.id} data-scroll-target> {category.name} </span>
                        {menuItems.filter(menuItem => menuItem.category === category.name).map((item) => (
                            <MenuItem key={item.id} item={item} handleCart={handleCart} additions={additions}/>
                        ))}
                    </div>
                );
            })}

            <div className='summary-wrapper' id='summary'>
                <span>
                    Total: R${" "}
                    {list.reduce((acc, item) => {const price = parseFloat(item.price) || 0;
                        return acc + price;
                    }, 0).toFixed(2)}
                </span>
                <button className='proceed'>CONTINUAR</button>
            </div>
            <Floater/>
        </div>
    );
  }
  
export default Menu;
  