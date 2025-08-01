import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Auth from "./pages/admin/Auth";
import Admin from "./pages/admin";
import { useCallback, useState } from "react";
import Loader from "./components/loader";

function App() {
  const [loading, setLoading] = useState(false);
  const setLoad = useCallback((value) => setLoading(value), []);
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  return (
    <BrowserRouter>
      <Loader loading={loading} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              cart={cart}
              setCart={setCart}
              loading={setLoad}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              setCart={setCart}
              loading={setLoad}
            />
          }
        />
        <Route
          path="/auth"
          element={<Auth loading={setLoad} />}
        />
        <Route
          path="/admin"
          element={<Admin loading={setLoad} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
