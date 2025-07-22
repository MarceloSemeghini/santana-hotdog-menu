import { useEffect, useRef, useState } from "react";
import { FaGears } from "react-icons/fa6";

function Actions({ children }) {
  const [active, setActive] = useState(false);
  const wrapperRef = useRef(null);

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
    <div id="actions" ref={wrapperRef}>
      {active ? (
        <div className="actions">{children}</div>
      ) : (
        <div className="actions-icon" onClick={() => setActive(true)}>
          <FaGears size={"2rem"}/>
        </div>
      )}
    </div>
  );
}

export default Actions;
