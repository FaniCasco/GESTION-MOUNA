// gestion/src/components/Stock.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStock, addOrUpdateStock, updateStockEntry, deleteStock } from '../redux/actions/stockActions';
import { getProductos } from '../redux/actions/productosActions';
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

function Stock() {
  const dispatch = useDispatch();
  const { stockItems, loading, error } = useSelector(state => state.stock);
  const { data: productos } = useSelector(state => state.productos);
  const productosLoading = useSelector(state => state.productos.loading);
  const productosError = useSelector(state => state.productos.error);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentStockItem, setCurrentStockItem] = useState(null);

  // --- formData incluye precio_compra ---
  const [formData, setFormData] = useState({
    producto_id: '',
    unidad: 0,
    precio_compra: 0,
    medida: '', 
  });

  // Efecto para cargar datos iniciales de stock y productos
  useEffect(() => {
    dispatch(getStock());
    dispatch(getProductos());
  }, [dispatch]);
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prevFormData => {
      // Si cambia el producto_id, buscamos su medida automáticamente
      if (name === 'producto_id') {
        const productoSeleccionado = productos.find(p => p.id === parseInt(value));
        return {
          ...prevFormData,
          [name]: value,
          medida: productoSeleccionado?.medida || '', // Autoasignar medida
        };
      }

      return {
        ...prevFormData,
        [name]: value
      };
    });
  }, [productos]);


  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentStockItem(null);
    // Reiniciar formData a su estado inicial
    setFormData({ producto_id: '', unidad: 0, precio_compra: 0, medida: '' });
  }, []);

  const handleShowAddModal = useCallback(() => {
    setModalMode(MODAL_MODES.ADD);
    setCurrentStockItem(null);
    // Reiniciar formData para añadir
    setFormData({ producto_id: '', unidad: 0, precio_compra: 0, medida: '' });
    setShowModal(true);
  }, []);

  const handleShowViewModal = useCallback((stockItem) => {
    setModalMode(MODAL_MODES.VIEW);
    setCurrentStockItem(stockItem);
    // Establecer formData con los datos del stockItem para visualización
    setFormData({
      producto_id: stockItem.producto_id,
      unidad: stockItem.unidad,
      precio_compra: stockItem.precio_compra || 0,
      medida: stockItem.medida
    });
    setShowModal(true);
  }, []);

  const handleShowEditModal = useCallback((stockItem) => {
    setModalMode(MODAL_MODES.EDIT);
    setCurrentStockItem(stockItem);
    // Establecer formData con los datos del stockItem para edición
    setFormData({
      producto_id: stockItem.producto_id,
      unidad: stockItem.unidad,
      precio_compra: stockItem.precio_compra || 0,
      medida: stockItem.medida
    });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validaciones para cantidad y precio de compra
    if (!formData.producto_id ||
      formData.unidad === undefined || parseFloat(formData.unidad) < 0 ||
      formData.precio_compra === undefined || parseFloat(formData.precio_compra) < 0) {
      MySwal.fire({ icon: 'warning', title: 'Campos Requeridos', text: 'Debe seleccionar un Producto y asegurar que Cantidad y Precio de Compra no sean negativos.' });
      return;
    }

    // Preparar datos para enviar al backend, asegurando tipos numéricos
    const stockDataToSend = {
      ...formData,
      unidad: parseFloat(formData.unidad),
      precio_compra: parseFloat(formData.precio_compra)
    };

    const handleSuccess = () => {
      handleCloseModal();
      dispatch(getStock()); // Re-fetch para asegurar que la tabla se actualice
    };

    const handleError = (err) => {
      MySwal.fire({ icon: 'error', title: `Error al ${modalMode === MODAL_MODES.EDIT ? 'Actualizar' : 'Añadir Stock'}`, text: `Hubo un problema: ${err.message || err.toString()}` });
    };

    if (modalMode === MODAL_MODES.EDIT && currentStockItem) {
      dispatch(updateStockEntry(currentStockItem.id, stockDataToSend)).then(handleSuccess).catch(handleError);
    } else if (modalMode === MODAL_MODES.ADD) {
      dispatch(addOrUpdateStock(stockDataToSend)).then(handleSuccess).catch(handleError);
    }
  }, [dispatch, formData, modalMode, currentStockItem, handleCloseModal]);

  const handleDeleteStock = useCallback((stockId) => {
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
        dispatch(deleteStock(stockId)).then(() => {
          MySwal.fire('¡Eliminado!', 'El registro de stock ha sido eliminado.', 'success');
          dispatch(getStock()); // Re-fetch para actualizar la lista después de eliminar
        }).catch((err) => {
          MySwal.fire('Error', `Hubo un problema al eliminar el stock: ${err.message || err.toString()}`, 'error');
        });
      }
    });
  }, [dispatch]);

  const getModalTitle = useCallback(() => {
    switch (modalMode) {
      case MODAL_MODES.ADD: return 'Añadir Stock';
      case MODAL_MODES.EDIT: return 'Editar Stock';
      case MODAL_MODES.VIEW: return 'Detalles de Stock';
      default: return 'Stock';
    }
  }, [modalMode]);

  const renderModalBody = useCallback(() => {
    // Obtener el producto seleccionado para mostrar su medida y precio de venta
    const productoSeleccionado = productos?.find(p => String(p.id) === formData.producto_id);


    if (modalMode === MODAL_MODES.VIEW && currentStockItem) {
      const productoAsociado = productos?.find(p => p.id === currentStockItem?.producto_id);

      return (
        <div>
          <Row>
            <Col md={6}><p><strong>ID Registro Stock:</strong> {currentStockItem.id}</p></Col>
            <Col md={6}><p><strong>Producto ID:</strong> {currentStockItem.producto_id}</p></Col>
            <Col md={12}><p><strong>Producto:</strong> {productoAsociado ? `${productoAsociado.nombre} (${productoAsociado.codigo})` : 'Cargando...'}</p></Col>
            <Col md={6}><p><strong>Medida del Producto:</strong> {productoAsociado?.medida || '—'}</p></Col>
            <Col md={6}><p><strong>Precio de Venta del Producto:</strong> {productoAsociado?.precio ? `$${parseFloat(productoAsociado.precio).toFixed(2)}` : '—'}</p></Col>
            <Col md={12}>
              <p>
                <strong>Cantidad en Stock:</strong>{' '}
                {currentStockItem.unidad !== null && currentStockItem.unidad !== undefined
                  ? `${parseFloat(currentStockItem.unidad).toFixed(2)} ${productoAsociado?.medida || ''}`
                  : '0.00'}
              </p>
            </Col>
            <Col md={12}>
              <p>
                <strong>Precio de Compra (este stock):</strong>{' '}
                {currentStockItem.precio_compra !== null && currentStockItem.precio_compra !== undefined
                  ? `$${parseFloat(currentStockItem.precio_compra).toFixed(2)}`
                  : '0.00'}
              </p>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <Form id="modalForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Producto</Form.Label>
          <Form.Control
            as="select"
            name="producto_id"
            value={formData.producto_id}
            onChange={handleInputChange}
            required
            disabled={modalMode === MODAL_MODES.EDIT}
          >
            <option value="">-- Seleccione un producto --</option>
            {productos && productos.map(producto => (
              <option key={producto.id} value={String(producto.id)}>
                {`${producto.nombre} (${producto.codigo})`}
              </option>
            ))}

          </Form.Control>

          {modalMode === MODAL_MODES.ADD && formData.producto_id && (
            <Form.Text className="text-primary mb-2 d-block">
              {(() => {
                const stockExistente = stockItems.find(s => s.producto_id === Number(formData.producto_id));

                if (stockExistente) {
                  return `Stock actual: ${parseFloat(stockExistente.unidad).toFixed(2)} ${productoSeleccionado?.medida || ''}`;
                } else {
                  return `Este producto no tiene stock cargado aún.`;
                }
              })()}
            </Form.Text>
          )}
        </Form.Group>

        {/* --- NUEVO CAMPO: Medida del Producto (solo lectura) --- */}
        {formData.producto_id && productoSeleccionado && (
          <Form.Group className="mb-3">
            <Form.Label>Medida del Producto</Form.Label>
            <Form.Control
              type="text"
              value={productoSeleccionado.medida || 'N/A'} // <--- Aquí intentas leer 'medida'
              readOnly
              disabled
            />
            <Form.Text className="text-muted">
              La cantidad se registrará en esta unidad.
            </Form.Text>
          </Form.Group>
        )}

        {/* --- Campo para la Cantidad en Stock: Permite decimales con step="0.01" --- */}
        <Form.Group className="mb-3">
          <Form.Label>Cantidad en Stock</Form.Label>
          <Form.Control
            type="number"
            name="unidad"
            value={formData.unidad}
            onChange={handleInputChange}
            step="0.01" // Permite dos decimales, útil para KG, Litros, etc.
            min="0"
            required
          />
          <Form.Text className="text-muted">
            Ingrese la cantidad en {productoSeleccionado?.medida || 'la unidad de medida del producto'}.
          </Form.Text>
        </Form.Group>



        {/* --- Campo para el Precio de Compra: Permite decimales con step="0.01" --- */}
        <Form.Group className="mb-3">
          <Form.Label>Precio de Compra (por unidad)</Form.Label>
          <Form.Control
            type="number"
            name="precio_compra"
            value={formData.precio_compra}
            onChange={handleInputChange}
            step="0.01" // Permite dos decimales para el precio
            min="0"
            required
          />
        </Form.Group>
      </Form>
    );
  }, [modalMode, currentStockItem, productos, formData, handleInputChange, handleSubmit, stockItems]);

  const renderModalFooter = useCallback(() => {
    if (modalMode === MODAL_MODES.VIEW) {
      return <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>;
    } else {
      return (
        <>
          <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancelar</Button>
          <Button variant="primary" type="submit" form="modalForm">
            {modalMode === MODAL_MODES.EDIT ? 'Actualizar Stock' : 'Añadir Stock'}
          </Button>
        </>
      );
    }
  }, [modalMode, handleCloseModal]);

  const isPageLoading = loading || productosLoading;

  if (isPageLoading) return <Loader />;
  if (error) return <div className="alert alert-danger">Error al cargar stock: {error}</div>;
  if (productosError) return <div className="alert alert-danger">Error al cargar productos: {productosError}</div>;

  return (
    <div className="stock-page">
      <h2>Gestión de Stock</h2>
      <Button variant="primary" onClick={handleShowAddModal} className="mb-3">
        Añadir Stock
      </Button>

      {stockItems && stockItems.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID Stock</th>
              <th>Producto (ID)</th>
              <th>Código</th>
              <th>Nombre Producto</th>
              <th>Cantidad en Stock</th>
              <th>Precio de Compra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.producto_id}</td>
                <td>{item.producto ? item.producto.codigo : 'N/A'}</td>
                <td>{item.producto ? item.producto.nombre : 'N/A'}</td>
                <td>
                  {item.unidad !== null && item.unidad !== undefined
                    ? `${parseFloat(item.unidad).toFixed(2)} ${item.producto?.medida || ''}`
                    : '0.00'}
                </td>
                <td>
                  {item.precio_compra !== null && item.precio_compra !== undefined
                    ? `$${parseFloat(item.precio_compra).toFixed(2)}`
                    : '0.00'}
                </td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleShowViewModal(item)} className="me-1"><FaEye /> Ver</Button>
                  <Button variant="warning" size="sm" onClick={() => handleShowEditModal(item)} className="me-1"><FaEdit /> Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteStock(item.id)}><FaTrash /> Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No hay stock registrado.</p>
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

export default Stock;