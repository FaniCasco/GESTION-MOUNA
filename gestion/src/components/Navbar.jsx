import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand" to="/">Mouna</Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/clientes">Clientes</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/proveedores">Proveedores</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/ventas">Ventas</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
