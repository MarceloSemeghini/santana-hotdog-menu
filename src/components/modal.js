import { useEffect, useRef } from "react";

function Modal({ children, active, close }) {
  const wrapperRef = useRef(null);

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
    <div id="overlay" className={active && "active"}>
      <div id="modal" ref={wrapperRef}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
