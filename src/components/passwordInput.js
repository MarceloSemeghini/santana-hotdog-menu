import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function PasswordInput({ onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{position: "relative", display: "flex"}}>
      <input
        type={showPassword ? "text" : "password"}
        style={{width: "100%"}}
        id="password"
        placeholder="******"
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="icon floating"
        onClick={() => setShowPassword(!showPassword)}
        style={{position: "absolute", right: "0", top: "0", background: "transparent", border: "none"}}
      >
        {showPassword ? <FaEyeSlash color="var(--primary)" size={"1.2rem"}/> : <FaEye color="var(--primary)" size={"1.2rem"}/>}
      </button>
    </div>
  );
}

export default PasswordInput;
