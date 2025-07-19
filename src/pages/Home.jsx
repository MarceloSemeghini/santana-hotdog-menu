import Header from "../components/header";
import Checkout from "../components/order/checkout";
import Menu from "../components/order/menu";
import { useEffect, useState } from "react";

function Home() {
  const [shopList, setShopList] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [listReady, setListReady] = useState(false);
  const categories = [
    {
      id: 1,
      name: "Lanches",
    },
    {
      id: 2,
      name: "Doces",
    },
    {
      id: 3,
      name: "Bebidas",
    },
  ];

  useEffect(() => {
    const headerContent = document.getElementById("header-content");
    let menuLinks = [];

    if (headerContent) {
      menuLinks = headerContent.getElementsByClassName("menu-category-scroll");
    }

    if (menuLinks.length > 0) {
      Array.from(menuLinks).forEach((item) => {
        item.addEventListener("click", handleClick);
      });
    }

    return () => {
      Array.from(menuLinks).forEach((item) => {
        item.removeEventListener("click", handleClick);
      });
    };
  }, []);

  function handleClick(e) {
    const key = e.target.getAttribute("data-key");
    const target = document.querySelector(
      `[data-key="${key}"][data-scroll-target]`
    );

    if (!target) return;

    const menu = document.getElementById("wrapper");
    let paddingOffset = 0;

    if (menu) {
      const computedStyle = getComputedStyle(menu);
      const paddingTop = computedStyle.paddingTop;
      paddingOffset = parseFloat(paddingTop) || 0;
    }

    const offset =
      target.getBoundingClientRect().top + window.scrollY - paddingOffset;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    fetch("/itens", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => console.log("Item adicionado:", data));
  }, []);

  useEffect(() => {
    const buttons = document.querySelectorAll("button.proceed");

    const handleClick = () => {
      if (shopList.length > 0) {
        setListReady(true);
      } else if (shopList.length <= 0) {
        alert("Seu carrinho está vazio.");
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", handleClick);
    });

    return () => {
      buttons.forEach((button) => {
        button.removeEventListener("click", handleClick);
      });
    };
  }, [shopList]);

  function removeItem(indexToRemove) {
    const updatedList = shopList.filter((_, index) => index !== indexToRemove);
    setShopList(updatedList);
    if (updatedList.length === 0) {
      setListReady(false);
    }
    localStorage.setItem("cart", JSON.stringify(updatedList));
  }

  return (
    <>
      <Header>
        {!listReady && (
          <>
            {categories.map((category, index) => (
              <span
                className="menu-category-scroll"
                key={category.id + index}
                data-key={category.id}
              >
                {category.name}
              </span>
            ))}
          </>
        )}
      </Header>
      <div className="home page" id="wrapper">
        {!listReady ? (
          <Menu list={shopList} setList={setShopList} categories={categories} />
        ) : (
          <Checkout list={shopList} removeItem={removeItem} />
        )}
      </div>
    </>
  );
}

export default Home;
