import { useEffect, useRef, useState } from "react";
import { IoClose, IoMenu } from "react-icons/io5";

function Drawer({ categories }) {
  const [active, setActive] = useState(false);
  const wrapperRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="menu-toggle" onClick={() => setActive(!active)}>
        {active ? <IoClose size={"3rem"} /> : <IoMenu size={"3rem"} />}
      </div>
      {active && (
        <>
          <div className="overlay" />
          <div className="drawer-menu" ref={wrapperRef}>
            <ul className="menu-options">
              {categories.map((category) => (
                <li key={category.id}>
                  <a href={`#${category.id}`} onClick={() => setActive(false)}>
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

export default Drawer;
