import Checkout from './components/checkout';
import Header from './components/header';
import Menu from './components/menu';
import { useEffect, useState } from 'react';

function App() {
    const [shopList, setShopList] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [listReady, setListReady] = useState(false);

    useEffect(() => {
        const buttons = document.querySelectorAll('button.proceed');

        const handleClick = () => {
            if(shopList.length > 0) {
                setListReady(true)
            } else if (shopList.length <= 0) {
                alert("Seu carrinho está vazio.");
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', handleClick);
        });

        return () => {
            buttons.forEach(button => {
                button.removeEventListener('click', handleClick);
            });
        };
    }, [shopList]);

    function removeItem (indexToRemove) {
        const updatedList = shopList.filter((_, index) => index !== indexToRemove);
        setShopList(updatedList);
        if (updatedList.length === 0) {
            setListReady(false);
        }
        localStorage.setItem("cart", JSON.stringify(updatedList));
    }

    console.log(shopList)

    return (
        <div className="App">
            <Header />
            {!listReady 
            ?
                <Menu list={shopList} setList={setShopList}/>
            :
                <Checkout list={shopList} removeItem={removeItem}/>
            }
        </div>
    );
}

export default App;
