import { useEffect, useState } from 'react';
import axios from 'axios';

function Clientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/clientes')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Error al traer clientes:', error));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Clientes</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre y Apellido</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Deuda</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.dni}</td>
              <td>{cliente.nombre_apellido}</td>
              <td>{cliente.direccion}</td>
              <td>{cliente.telefono}</td>
              <td>${cliente.deuda}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
