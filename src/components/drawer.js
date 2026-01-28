import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";

function Drawer({ categories, active, close }) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    if (active && !hasMounted) {
      setHasMounted(true)
    }
    if (active !== open) {
      setOpen(active)
    }
  }, [active])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={hasMounted ? open ? "show" : "hidden" : ""} id="drawer">
        <div className="overlay"></div>
        <div className="drawer-menu" ref={wrapperRef}>
          <h3 className="drawer-header">
            Menu
            <IoClose size={"1.5rem"} onClick={() => close()}/>
          </h3> 
          <ul className="menu-options">
            {categories.map((category) => (
              <li key={category.id}>
                <a href={`#${category.id}`} onClick={() => close()}>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Drawer;
