// gestion/src/components/Clientes.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getClientes,
  addCliente,
  updateCliente,
  deleteCliente,
  getClienteDetailsById // Importa la acción para obtener detalles por ID
} from '../redux/actions/clientesActions';

import Loader from './Loader';
import Modal from './Modal';
import Button from './Button';

import { Table, Form, Row, Col, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const MODAL_MODES = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
};

function Clientes() {
  const dispatch = useDispatch();
  // Selecciona los estados necesarios del reducer de clientes
  const {
    clientes, // Lista de clientes
    loadingList, // Estado de carga para la lista
    errorList, // Estado de error para la lista
    selectedCliente, // Cliente individual seleccionado
    loadingSelectedCliente, // Estado de carga para el cliente individual
    errorSelectedCliente, // Estado de error para el cliente individual
  } = useSelector(state => state.clientes);


  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentClienteId, setCurrentClienteId] = useState(null);


  const [formData, setFormData] = useState({
    dni: '',
    nombre_apellido: '',
    direccion: '',
    telefono: '',
  });


  // Cargar clientes cuando el componente se monta
  useEffect(() => {
    dispatch(getClientes()); // Llama a la acción para obtener la lista (ahora con deuda)
  }, [dispatch]);


  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  }, []);

  const handleShowAddModal = useCallback(() => {
    setModalMode(MODAL_MODES.ADD);
    setCurrentClienteId(null);
    setFormData({
      dni: '',
      nombre_apellido: '',
      direccion: '',
      telefono: '',
    });
    setShowModal(true);
  }, []);

  // Dispara la acción para obtener el cliente con deuda al ver detalle
  const handleShowViewModal = useCallback((cliente) => {
    setModalMode(MODAL_MODES.VIEW);
    setCurrentClienteId(cliente.id);

    // Limpia el cliente seleccionado previamente
    dispatch({ type: 'RESET_SELECTED_CLIENT' });

    // Dispara la acción para obtener los detalles del cliente por ID (con totalDeuda)
    dispatch(getClienteDetailsById(cliente.id));

    setShowModal(true);
  }, [dispatch]);


  // Carga datos para editar (sin campo deuda)
  const handleShowEditModal = useCallback((cliente) => {
    setModalMode(MODAL_MODES.EDIT);
    setCurrentClienteId(cliente.id);
    setFormData({
      dni: cliente.dni,
      nombre_apellido: cliente.nombre_apellido,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
    });
    setShowModal(true);
  }, []);


  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentClienteId(null);
    setFormData({
      dni: '',
      nombre_apellido: '',
      direccion: '',
      telefono: '',
    });
    // Resetea el estado del cliente individual al cerrar el modal
    dispatch({ type: 'RESET_SELECTED_CLIENT' });
  }, [dispatch]);


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.dni || !formData.nombre_apellido) {
      MySwal.fire({ icon: 'warning', title: 'Campos Requeridos', text: 'El DNI y Nombre/Apellido son obligatorios.' });
      return;
    }

    const clienteDataToSend = { ...formData }; // No incluye 'deuda'

    const showErrorAlert = (message) => {
      MySwal.fire({ icon: 'error', title: `Error al ${modalMode === MODAL_MODES.EDIT ? 'Actualizar' : 'Añadir'}`, text: `Hubo un problema: ${message}` });
    };


    if (modalMode === MODAL_MODES.EDIT && currentClienteId) {
      try {
        await dispatch(updateCliente(currentClienteId, clienteDataToSend));
        MySwal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
        handleCloseModal();
      } catch (err) {
        showErrorAlert(err.message);
      }
    } else if (modalMode === MODAL_MODES.ADD) {
      try {
        await dispatch(addCliente(clienteDataToSend));
        MySwal.fire('Éxito', 'Cliente añadido correctamente', 'success');
        handleCloseModal();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  }, [dispatch, formData, modalMode, currentClienteId, handleCloseModal]);


  const handleDeleteCliente = useCallback(async (clienteId) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?', text: "¡No podrás revertir esto!", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCliente(clienteId));
        MySwal.fire('¡Eliminado!', 'El cliente ha sido eliminado.', 'success');
      } catch (err) {
        const errorMessage = err.message || 'Hubo un problema al eliminar el cliente.';
        MySwal.fire('Error', errorMessage, 'error');
      }
    }
  }, [dispatch]);


  const getModalTitle = useCallback(() => {
    switch (modalMode) {
      case MODAL_MODES.ADD: return 'Añadir Nuevo Cliente';
      case MODAL_MODES.EDIT: return 'Editar Cliente';
      case MODAL_MODES.VIEW: return 'Detalles del Cliente';
      default: return 'Cliente';
    }
  }, [modalMode]);


  const renderModalBody = useCallback(() => {
    // Si el modo es VIEW, mostramos la información usando selectedCliente
    if (modalMode === MODAL_MODES.VIEW) {
      // Usar loadingSelectedCliente para mostrar el spinner en el modal de vista
      if (loadingSelectedCliente) {
        return <div className="text-center"><Spinner animation="border" size="sm" /><p>Cargando cliente...</p></div>;
      }
      // Usar errorSelectedCliente para mostrar el error en el modal de vista
      if (errorSelectedCliente) {
        return <div className="alert alert-danger">Error al cargar detalles del cliente: {errorSelectedCliente}</div>;
      }
      if (selectedCliente) { // Usamos selectedCliente que tiene totalDeuda
        return (
          <div>
            <Row>
              <Col md={6}><p><strong>ID:</strong> {selectedCliente.id}</p></Col>
              <Col md={6}><p><strong>DNI:</strong> {selectedCliente.dni}</p></Col>
              <Col md={12}><p><strong>Nombre y Apellido:</strong> {selectedCliente.nombre_apellido}</p></Col>
              <Col md={12}><p><strong>Dirección:</strong> {selectedCliente.direccion || 'N/A'}</p></Col>
              <Col md={6}><p><strong>Teléfono:</strong> {selectedCliente.telefono || 'N/A'}</p></Col>
              {/* Mostrar la deuda calculada (totalDeuda) */}
              <Col md={6}><p><strong>Deuda Total:</strong> ${selectedCliente.totalDeuda !== null && selectedCliente.totalDeuda !== undefined ? parseFloat(selectedCliente.totalDeuda).toFixed(2) : '0.00'}</p></Col>
            </Row>
          </div>
        );
      }
      // Mensaje si no hay cliente seleccionado (estado inicial o después de reset)
      return <p>Seleccione un cliente para ver los detalles.</p>;

    }

    // Si el modo es ADD o EDIT, mostramos el formulario (sin campo deuda)
    return (
      <Form id="modalForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>DNI</Form.Label>
          <Form.Control
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleInputChange}
            required
            disabled={modalMode === MODAL_MODES.EDIT}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nombre y Apellido</Form.Label>
          <Form.Control
            type="text"
            name="nombre_apellido"
            value={formData.nombre_apellido}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
          />
        </Form.Group>
        {/* El campo Deuda ha sido eliminado de los formularios de Añadir/Editar */}
      </Form>
    );
  }, [modalMode, loadingSelectedCliente, errorSelectedCliente, selectedCliente, formData, handleInputChange, handleSubmit]);


  const renderModalFooter = useCallback(() => {
    if (modalMode === MODAL_MODES.VIEW) {
      return (
        <Button variant="secondary" onClick={handleCloseModal}>
          Cerrar
        </Button>
      );
    } else { // ADD o EDIT mode
      // Usamos loadingList para deshabilitar el botón mientras se guarda (ya que add/update recargan la lista)
      const isSubmitting = loadingList;

      return (
        <>
          <Button variant="secondary" onClick={handleCloseModal} className="me-2" disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="modalForm" disabled={isSubmitting}>
            {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" /> : ''}
            {modalMode === MODAL_MODES.EDIT ? 'Actualizar Cliente' : 'Añadir Cliente'}
          </Button>
        </>
      );
    }
  }, [modalMode, handleCloseModal, loadingList]); // Dependencias actualizadas


  // Mostrar loader si está cargando la lista principal de clientes (usar loadingList)
  if (loadingList) {
    return <Loader />;
  }

  // Mostrar mensaje de error si hay uno al cargar la lista principal (usar errorList)
  if (errorList) {
    return (
      <div className="alert alert-danger">
        <h4>Error cargando clientes</h4>
        <p>{errorList}</p>
        <button onClick={() => dispatch(getClientes())}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="clientes-page">
      <h2>Gestión de Clientes</h2>
      <Button variant="primary" onClick={handleShowAddModal} className="mb-3">
        Añadir Nuevo Cliente
      </Button>

      {/* Tabla de Clientes */}
      {clientes && clientes.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>DNI</th>
              <th>Nombre y Apellido</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              {/* La columna Deuda Total ahora muestra el campo calculado */}
              <th>Deuda Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.dni}</td>
                <td>{cliente.nombre_apellido}</td>
                <td>{cliente.direccion}</td>
                <td>{cliente.telefono}</td>
                {/* Mostrar el campo totalDeuda que viene del backend */}
                <td>${cliente.totalDeuda !== null && cliente.totalDeuda !== undefined ? parseFloat(cliente.totalDeuda).toFixed(2) : '0.00'}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowViewModal(cliente)}
                    className="me-1"
                  >
                    <FaEye /> Ver
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleShowEditModal(cliente)}
                    className="me-1"
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCliente(cliente.id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No hay clientes registrados.</p>
      )}

      {/* Modal de Cliente (Añadir, Editar, Ver Detalle) */}
      <Modal
        show={showModal}
        handleClose={handleCloseModal}
        title={getModalTitle()}
        footer={renderModalFooter()}
      >
        {renderModalBody()}
      </Modal>
    </div>
  );
}

export default Clientes;