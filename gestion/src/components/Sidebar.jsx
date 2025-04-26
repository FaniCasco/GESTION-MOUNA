import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-light border-end vh-100 p-3" style={{ width: "220px" }}>
      <h5 className="text-center mb-4">Menú</h5>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link text-dark" to="/">Inicio</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-dark" to="/clientes">Clientes</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-dark" to="/proveedores">Proveedores</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-dark" to="/ventas">Ventas</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
