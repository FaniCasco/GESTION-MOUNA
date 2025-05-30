import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto
} from '../redux/actions/productosActions';
import { getProveedores } from '../redux/actions/proveedoresActions';

import Loader from './Loader';
import Modal from './Modal';
import Button from './Button';

import { Table, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const MODAL_MODES = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
};

function Productos() {
  const dispatch = useDispatch();

  const {
    data: productos,
    loading: loadingProductos,
    error: errorProductos
  } = useSelector(state => state.productos);

  const {
    data: proveedores,
    loading: loadingProveedores,
    error: errorProveedores
  } = useSelector(state => state.proveedores);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentProducto, setCurrentProducto] = useState(null);

  // Estado local para los datos del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    medida: '', // <--- Aquí es donde se guarda la unidad de medida
    precio: 0,
    proveedor_id: null
  });

  // Cargar productos y proveedores al montar el componente
  useEffect(() => {
    dispatch(getProductos());
    dispatch(getProveedores());
  }, [dispatch]);

  console.log("Proveedores cargados:", proveedores);
  console.log("Estado completo de Redux:", useSelector(state => state));
  console.log("Productos en Redux:", productos);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: name === 'proveedor_id' ? (value ? parseInt(value) : null) : value
    }));
  }, []);

  const handleShowAddModal = useCallback(() => {
    setModalMode(MODAL_MODES.ADD);
    setCurrentProducto(null);
    setFormData({
      codigo: '',
      nombre: '',
      medida: '',
      precio: 0,
      proveedor_id: null
    });
    setShowModal(true);
  }, []);

  const handleShowViewModal = useCallback((producto) => {
    setModalMode(MODAL_MODES.VIEW);
    setCurrentProducto(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      medida: producto.medida,
      precio: producto.precio,
      proveedor_id: producto.proveedor_id
    });
    setShowModal(true);
  }, []);

  const handleShowEditModal = useCallback((producto) => {
    setModalMode(MODAL_MODES.EDIT);
    setCurrentProducto(producto);
    setFormData({
      ...producto, // ← Usar spread operator para capturar todos los campos
      proveedor_id: producto.proveedor_id || null // ← Asegurar valor null
    });
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentProducto(null);
    setFormData({
      codigo: '',
      nombre: '',
      medida: '',
      precio: 0,
      proveedor_id: null
    });
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validación mejorada del precio
    if (!formData.codigo || !formData.nombre ||
      isNaN(formData.precio) || formData.precio <= 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campos inválidos',
        text: 'Código, Nombre y Precio válido son obligatorios',
      });
      return;

    }

    const productoDataToSend = {
      ...formData,
      precio: parseFloat(formData.precio),
      proveedor_id: formData.proveedor_id || null
    };

    const handleSuccess = () => {
      handleCloseModal();
      dispatch(getProductos());
    };

    const handleError = (err) => {
      MySwal.fire({
        icon: 'error',
        title: `Error al ${modalMode === MODAL_MODES.EDIT ? 'Actualizar' : 'Añadir'}`,
        text: `Hubo un problema: ${err}`,
      });
    };

    if (modalMode === MODAL_MODES.EDIT && currentProducto) {
      dispatch(updateProducto(currentProducto.id, productoDataToSend))
        .then(handleSuccess)
        .catch(handleError);
    } else if (modalMode === MODAL_MODES.ADD) {
      dispatch(addProducto(productoDataToSend))
        .then(handleSuccess)
        .catch(handleError);
    }
  }, [dispatch, formData, modalMode, currentProducto, handleCloseModal]);



  const handleDeleteProducto = useCallback((productoId) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProducto(productoId))
          .then(() => {
            MySwal.fire(
              '¡Eliminado!',
              'El producto ha sido eliminado.',
              'success'
            );
          })
          .catch((err) => {
            MySwal.fire(
              'Error',
              `Hubo un problema al eliminar el producto: ${err}`,
              'error'
            );
          });
      }
    });
  }, [dispatch]);

  const getModalTitle = useCallback(() => {
    switch (modalMode) {
      case MODAL_MODES.ADD:
        return 'Añadir Nuevo Producto';
      case MODAL_MODES.EDIT:
        return 'Editar Producto';
      case MODAL_MODES.VIEW:
        return 'Detalles del Producto';
      default:
        return 'Producto';
    }
  }, [modalMode]);

  const renderModalBody = useCallback(() => {
    if (modalMode === MODAL_MODES.VIEW && currentProducto) {
      const proveedor = proveedores?.find(p => p.id === currentProducto.proveedor_id);

      return (
        <div>
          <Row>
            <Col md={6}><p><strong>ID:</strong> {currentProducto.id}</p></Col>
            <Col md={6}><p><strong>Código:</strong> {currentProducto.codigo}</p></Col>
            <Col md={12}><p><strong>Nombre:</strong> {currentProducto.nombre}</p></Col>
            <Col md={6}><p><strong>Unidad:</strong> {currentProducto.medida || 'N/A'}</p></Col>
            <Col md={6}><p><strong>Precio:</strong> ${currentProducto.precio?.toFixed(2) || '0.00'}</p></Col>
            <Col md={6}><p><strong>Proveedor:</strong> {proveedor?.empresa || 'N/A'}</p></Col>
          </Row>
        </div>
      );
    }

    return (
      <Form id="modalForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Código</Form.Label>
          <Form.Control
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            required
            disabled={modalMode === MODAL_MODES.EDIT}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Unidad</Form.Label>
          <Form.Select
            name="medida"
            value={formData.medida}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione una unidad</option>
            <option value="kg">Kilogramos (kg)</option>
            <option value="gm">Gramos (gramos)</option>
            <option value="ltr">Litros (litro)</option>
            <option value="ml">Mililitros (mililitros)</option>
            <option value="uni">Unidad</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            step="0.01"
            required
            min="0.01"
          />
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>Proveedor</Form.Label>
          <Form.Select
            name="proveedor_id"
            value={formData.proveedor_id || ''} // Maneja null correctamente
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({
                ...prev,
                proveedor_id: value ? parseInt(value) : null
              }));
            }}
          >
            <option value="">Sin proveedor asignado</option>
            {proveedores?.map(proveedor => (
              <option
                key={proveedor.id}
                value={proveedor.id}
                selected={proveedor.id === formData.proveedor_id}
              >
                {proveedor.empresa} ({proveedor.id})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Form>
    );
  }, [modalMode, currentProducto, formData, handleInputChange, handleSubmit, proveedores]);

  const renderModalFooter = useCallback(() => {
    if (modalMode === MODAL_MODES.VIEW) {
      return (
        <Button variant="secondary" onClick={handleCloseModal}>
          Cerrar
        </Button>
      );
    } else {
      return (
        <>
          <Button variant="secondary" onClick={handleCloseModal} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="modalForm">
            {modalMode === MODAL_MODES.EDIT ? 'Actualizar Producto' : 'Añadir Producto'}
          </Button>
        </>
      );
    }
  }, [modalMode, handleCloseModal]);

  if (loadingProductos || loadingProveedores) {
    return <Loader />;
  }

  if (errorProductos) {
    return <div className="alert alert-danger">{errorProductos}</div>;
  }

  if (errorProveedores) {
    return <div className="alert alert-warning">Error al cargar proveedores: {errorProveedores}</div>;
  }

  return (
    <div className="productos-page">
      <h2>Gestión de Productos</h2>
      <Button variant="primary" onClick={handleShowAddModal} className="mb-3">
        Añadir Nuevo Producto
      </Button>

      {productos?.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Unidad de medida</th>
              <th>Precio</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => {
              return (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>{producto.codigo || 'Sin código'}</td>
                  <td>{producto.nombre || 'Sin nombre'}</td>
                  <td>{producto.medida || 'N/A'}</td>
                  <td>${Number(producto.precio || 0).toFixed(2)}</td>
                  <td>
                    {producto.proveedor_id ? (
                      proveedores.find(p => p.id === producto.proveedor_id)?.empresa || 'Proveedor eliminado'
                    ) : 'Sin proveedor'}
                  </td>
                  <td>
                    
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleShowViewModal(producto)}
                      className="me-1"
                    >
                      <FaEye /> Ver
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleShowEditModal(producto)}
                      className="me-1"
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProducto(producto.id)}
                    >
                      <FaTrash /> Eliminar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p>No hay productos registrados.</p>
      )}

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

export default Productos;