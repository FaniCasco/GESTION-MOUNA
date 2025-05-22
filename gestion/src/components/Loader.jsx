// gestion/src/components/Loader.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap'; // Usamos el Spinner de react-bootstrap

function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    </div>
  );
}

export default Loader;