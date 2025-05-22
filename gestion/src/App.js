// gestion/src/App.js
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
//import Sidebar from './components/Sidebar';
import Clientes from './components/Clientes';
import Proveedores from './components/Proveedores';
import Ventas from './components/Ventas';
import Productos from './components/Productos';
import Stock from './components/Stock';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './assets/images/mouna-pink.png';
import Footer from './components/Footer';

import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar /> {/* Navbar con las tarjetas integradas */}
      <div className="container-fluid main-container">
        <div className="row">
          {/* <div className="col-md-2 sidebar-col">
          <Sidebar /> Sidebar tradicional 
          </div>*/}
          <main className="col-md-10 content-col">
            <Routes>
              {/* Página de inicio simplificada */}
              <Route path="/" element={
                <div className="titulo-main">
                  <h1>¡Hola Desiré!
                  </h1>

                  <img
                    src={logo}
                    alt="Logo"
                    className="main-logo"
                    width="150px"
                  />
                </div>
              } />

              {/* Rutas principales */}
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/ventas" element={<Ventas />} />

              {/* Ruta adicional si quieres mantener inventario como alias */}
              <Route path="/inventario" element={<Stock />} />
            </Routes>
          </main>      
        </div>
      </div>
      <Footer /> {/* Pie de página */}
    </div>
);
};
export default App;