import Header from './components/header';
import Footer from './components/footer';
import MenuItem from './components/menuItem';

function App() {
    const menuItems = [
        {
            name: "Cachorro-Quente Simples",
            ingredients: ["Pão", "Salsicha", "Molho de Tomate"],
            price: 8.50,
            image: ""
        },
        {
            name: "Cachorro-Quente com Queijo",
            ingredients: ["Pão", "Salsicha", "Queijo", "Molho de Tomate"],
            price: 10.00,
            image: "./img/hotdog-photo.png"
        },
        {
            name: "Cachorro-Quente Especial",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar"],
            price: 12.00,
            image: "./img/hotdog-photo.png"
        },
        {
            name: "Cachorro-Quente com Bacon",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar", "Bacon"],
            price: 12.00,
            image: ""
        },
        {
            name: "Cachorro-Quente Simples",
            ingredients: ["Pão", "Salsicha", "Molho de Tomate"],
            price: 8.50,
            image: ""
        },
        {
            name: "Cachorro-Quente com Queijo",
            ingredients: ["Pão", "Salsicha", "Queijo", "Molho de Tomate"],
            price: 10.00,
            image: "./img/hotdog-photo.png"
        },
        {
            name: "Cachorro-Quente Especial",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar"],
            price: 12.00,
            image: "./img/hotdog-photo.png"
        },
        {
            name: "Cachorro-Quente com Bacon",
            ingredients: ["Pão", "Salsicha", "Bacon", "Cebola Crispy", "Queijo Cheddar", "Bacon"],
            price: 12.00,
            image: "./img/hotdog-photo.png"
        },
    ];

    return (
        <div className="App">
            <Header />
            <div className="menu">
              {menuItems.map((item, index) => (
                  <MenuItem key={index} item={item} />
              ))}

              <div className='menu-footer'>
                <button className='to-checkout'>Continuar</button>
              </div>
            </div>
            <Footer />
        </div>
    );
}

export default App;
