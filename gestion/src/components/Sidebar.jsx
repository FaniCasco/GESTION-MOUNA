// gestion/src/components/Sidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importa Link de react-router-dom

import {
  FaUsers,
  FaDollyFlatbed,
  FaShoppingCart,
  FaBox
} from 'react-icons/fa';

function Sidebar() {
  return (
    <Nav className="flex-column sidebar">
      {/* Usamos Nav.Link y le decimos que se renderice como Link */}
      <Nav.Link as={Link} to="/clientes">
        <FaUsers className="me-2" /> Clientes
      </Nav.Link>
       <Nav.Link as={Link} to="/productos">
        <FaBox className="me-2" /> Productos
      </Nav.Link>
      <Nav.Link as={Link} to="/proveedores">
        <FaDollyFlatbed className="me-2" /> Proveedores
      </Nav.Link>
       <Nav.Link as={Link} to="/stock">
         <FaDollyFlatbed className="me-2" /> Stock
       </Nav.Link>
      <Nav.Link as={Link} to="/ventas">
        <FaShoppingCart className="me-2" /> Ventas
      </Nav.Link>
      {/* Agrega más enlaces según tus necesidades */}
    </Nav>
  );
}

export default Sidebar;