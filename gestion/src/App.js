import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="d-flex">
        <Sidebar />

        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ventas" element={<Ventas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const Home = () => <h1>Bienvenido a Mouna Gestión</h1>;
const Clientes = () => <h1>Clientes</h1>;
const Proveedores = () => <h1>Proveedores</h1>;
const Ventas = () => <h1>Ventas</h1>;

export default App;

