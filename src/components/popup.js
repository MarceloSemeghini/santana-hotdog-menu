import { useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { IoAlertSharp, IoCloseSharp } from "react-icons/io5";

function Popup({ type = "default", message, onClose }) {
  useEffect(() => {
    if (message !== "") {
      const timer = setTimeout(() => {
        onClose();
      },2000);

      return () => clearTimeout(timer); 
    }
  }, [message, onClose]);
  return (
    message !== "" && (
      <div className={`popup type-${type}`}>
        {type === "success" && <IoMdCheckmark size={"2rem"} />}
        {type === "alert" && <IoAlertSharp size={"2rem"} />}
        <p>{message}</p>
        <IoCloseSharp size={"2rem"} onClick={onClose} />
      </div>
    )
  );
}

export default Popup;
