import React from 'react';
import { Navbar as BootstrapNavbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <BootstrapNavbar id="main-nav" expand="lg" className="nav-with-cards">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/">
          
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="nav-cards" />

        <BootstrapNavbar.Collapse id="nav-cards">
          <div className="nav-cards-container">
            <Nav className="mx-auto"> {/* Centra las cards */}
              <Nav.Item className="nav-card-item">
                <Link to="/clientes" className="nav-card pastel-blue">
                  <div className="card-content">
                    <h3>CLIENTES</h3>
                    <p>Registro de clientes</p>
                  </div>
                </Link>
              </Nav.Item>

              <Nav.Item className="nav-card-item">
                <Link to="/proveedores" className="nav-card pastel-green">
                 <div className="card-content">
                  <h3>PROVEEDORES</h3>
                  <p>Registro de proveedores</p>
                  </div>
                </Link>
              </Nav.Item>

              <Nav.Item className="nav-card-item">
                <Link to="/ventas" className="nav-card pastel-coral">
                     <div className="card-content">
                  <h3>VENTAS</h3>
                  <p>Registro de ventas</p>
                  </div>
                </Link>
              </Nav.Item>

              <Nav.Item className="nav-card-item">
                <Link to="/stock" className="nav-card pastel-lavanda">
                     <div className="card-content">
                  <h3>STOCK</h3>
                  <p>Control de existencias</p>
                  </div>
                </Link>
              </Nav.Item>

              <Nav.Item className="nav-card-item">
                <Link to="/productos" className="nav-card pastel-pink">
                     <div className="card-content">
                  <h3>PRODUCTOS</h3>
                  <p>Registro de productos</p>
                  </div>
                </Link>
              </Nav.Item>
              
            </Nav>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;