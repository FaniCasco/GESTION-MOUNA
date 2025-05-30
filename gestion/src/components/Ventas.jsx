// gestion/src/components/Ventas.jsx
// gestion/src/components/Ventas.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVentas, addVenta } from '../redux/actions/ventasActions';
import { getStock } from '../redux/actions/stockActions';
import { getClientes } from '../redux/actions/clientesActions';

import Loader from './Loader';
import Modal from './Modal';
import Button from './Button';

import { Table, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEye, FaPlus, FaTimes } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const MODAL_MODES = {
  ADD: 'add',
  VIEW: 'view',
};

// Opciones de métodos de pago
const METODOS_PAGO = ['Efectivo', 'Crédito', 'Débito', 'Transferencia', 'Debe'];

function Ventas() {
  const dispatch = useDispatch();
  const { ventas, loading, error } = useSelector(state => state.ventas);
  const { stockItems } = useSelector(state => state.stock); // Asume que stockItems incluye la relación con producto
  const { clientes } = useSelector(state => state.clientes);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentVenta, setCurrentVenta] = useState(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    cliente_id: '',
    detalles: [], // [{ producto_id, cantidad, precio_unitario, subtotal }]
    metodo_pago: '',
    monto_pagado: 0,
  });

  // Optimización: Crear un mapa de productos a partir de stockItems para búsquedas O(1)
  const stockItemsMap = useMemo(() => {
    return stockItems.reduce((acc, item) => {
      if (item.producto) { // Asegúrate de que el producto esté incluido
        acc[item.producto_id] = item.producto;
      }
      return acc;
    }, {});
  }, [stockItems]);

  // Función auxiliar para encontrar el producto por su ID usando el mapa optimizado
  const getProductInfoFromStock = useCallback((productId) => {
    return stockItemsMap[parseInt(productId)];
  }, [stockItemsMap]);

  const agregarProducto = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0
      }]
    }));
  }, []);

  const eliminarProducto = useCallback((index) => {
    setFormData(prev => {
      const nuevosDetalles = prev.detalles.filter((_, i) => i !== index);
      const nuevoTotal = nuevosDetalles.reduce((sum, item) => sum + item.subtotal, 0);
      // Ajustar monto_pagado si el total de la venta disminuye
      const nuevoMontoPagado = parseFloat(prev.monto_pagado) > nuevoTotal ? nuevoTotal : parseFloat(prev.monto_pagado) || 0;

      return {
        ...prev,
        detalles: nuevosDetalles,
        monto_pagado: nuevoMontoPagado, // Se recalcula el monto_pagado para no exceder el nuevo total
      };
    });
  }, []);

  const actualizarDetalle = useCallback((index, campo, valor) => {
    setFormData(prev => {
      const nuevosDetalles = [...prev.detalles];
      nuevosDetalles[index][campo] = valor;

      // Si cambia el producto_id, actualiza el precio unitario predeterminado del stock
      if (campo === 'producto_id' && valor) {
        const selectedProduct = getProductInfoFromStock(valor);
        if (selectedProduct) {
          nuevosDetalles[index].precio_unitario = parseFloat(selectedProduct.precio);
        } else {
          nuevosDetalles[index].precio_unitario = 0; // Reset si no encuentra el producto
        }
      }

      // Recalcular subtotal si cambia cantidad o precio
      if (campo === 'cantidad' || campo === 'precio_unitario' || campo === 'producto_id') {
        const cantidad = parseFloat(nuevosDetalles[index].cantidad) || 0;
        const precio = parseFloat(nuevosDetalles[index].precio_unitario) || 0;
        nuevosDetalles[index].subtotal = cantidad * precio;
      }

      // Recalcular el total y ajustar monto_pagado
      const nuevoTotal = nuevosDetalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
      const nuevoMontoPagado = parseFloat(prev.monto_pagado) > nuevoTotal ? nuevoTotal : parseFloat(prev.monto_pagado) || 0;

      return {
        ...prev,
        detalles: nuevosDetalles,
        monto_pagado: nuevoMontoPagado,
      };
    });
  }, [getProductInfoFromStock]);

  const handlePaymentChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };

      // Al cambiar el método de pago
      if (name === 'metodo_pago') {
        if (value === 'Debe') {
          newState.monto_pagado = 0; // Si es "Debe", el monto pagado es 0
        } else if (prev.metodo_pago === 'Debe' && parseFloat(prev.monto_pagado) === 0) {
          // Si cambia de "Debe" a otro método y el monto era 0, inicializar con el total actual
          const totalActual = newState.detalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
          newState.monto_pagado = totalActual;
        }
      }

      // Ajuste para que monto_pagado no exceda el total ni sea negativo
      const totalActual = newState.detalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
      if (name === 'monto_pagado') {
        let parsedValue = parseFloat(value) || 0; // Si es NaN, se asume 0

        if (parsedValue < 0) {
          parsedValue = 0; // Evitar valores negativos
        }
        if (parsedValue > totalActual && newState.metodo_pago !== 'Debe') {
          parsedValue = totalActual; // No permitir pagar más del total si no es "Debe"
        }
        newState.monto_pagado = parsedValue;
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    dispatch(getVentas());
    dispatch(getStock());
    dispatch(getClientes());
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentVenta(null);
    setFormData({
      fecha: new Date().toISOString().slice(0, 10),
      cliente_id: '',
      detalles: [],
      metodo_pago: '',
      monto_pagado: 0,
    });
  }, []);

  const handleShowAddModal = useCallback(() => {
    setModalMode(MODAL_MODES.ADD);
    setShowModal(true);
  }, []);

  const handleShowViewModal = useCallback((venta) => {
    setModalMode(MODAL_MODES.VIEW);
    setCurrentVenta(venta);
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validaciones básicas del formulario
    if (!formData.cliente_id) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'Seleccione un cliente.',
      });
      return;
    }

    if (formData.detalles.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Productos Requeridos',
        text: 'Agregue al menos un producto a la venta.',
      });
      return;
    }

    const detallesInvalidos = formData.detalles.some(detalle =>
      !detalle.producto_id || parseFloat(detalle.cantidad) <= 0 || parseFloat(detalle.precio_unitario) <= 0
    );

    if (detallesInvalidos) {
      MySwal.fire({
        icon: 'warning',
        title: 'Detalles Inválidos',
        text: 'Asegúrese de que cada producto tenga una cantidad y precio unitario válidos (mayores a cero).',
      });
      return;
    }

    if (!formData.metodo_pago) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'Seleccione un método de pago.',
      });
      return;
    }

    // Validar monto pagado si el método NO es "Debe"
    if (formData.metodo_pago !== 'Debe' && (parseFloat(formData.monto_pagado) <= 0 || isNaN(parseFloat(formData.monto_pagado)))) {
      MySwal.fire({
        icon: 'warning',
        title: 'Monto Pagado Inválido',
        text: 'Para el método de pago seleccionado, el monto pagado debe ser mayor a cero.',
      });
      return;
    }

    // Validar stock disponible para cada producto
    for (const detalle of formData.detalles) {
      // Encuentra el item de stock para el producto_id actual
      const stockItem = stockItems.find(item => item.producto_id === parseInt(detalle.producto_id));

      if (!stockItem || stockItem.unidad < parseFloat(detalle.cantidad)) {
        await MySwal.fire({
          icon: 'error',
          title: 'Stock Insuficiente',
          text: `No hay suficiente stock para el producto: ${getProductInfoFromStock(detalle.producto_id)?.nombre || 'Desconocido'}. Disponible: ${stockItem ? stockItem.unidad : 0}. Solicitado: ${detalle.cantidad}.`,
        });
        return;
      }
    }

    // Preparar los datos para enviar al backend
    const ventaDataToSend = {
      fecha: formData.fecha,
      cliente_id: parseInt(formData.cliente_id),
      detalles: formData.detalles.map(detalle => ({
        producto_id: parseInt(detalle.producto_id),
        cantidad: parseFloat(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario),
        subtotal: parseFloat(detalle.subtotal) // Ya calculado en el frontend
      })),
      metodo_pago: formData.metodo_pago,
      monto_pagado: parseFloat(formData.monto_pagado),
      // El total de la venta (total_venta) y la deuda (monto_deuda)
      // deben ser calculados en el backend para mayor seguridad y consistencia
      // pero si los envías desde el frontend, el backend debe validarlos.
      // Aquí, asumimos que el backend recalcula el total basado en los detalles.
    };

    try {
      await dispatch(addVenta(ventaDataToSend));
      MySwal.fire('Éxito', 'Venta registrada correctamente', 'success');
      handleCloseModal();
      dispatch(getVentas());
      dispatch(getStock()); // Recargar stock para reflejar los cambios
    } catch (err) {
      const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message || 'Error desconocido';
      MySwal.fire({
        icon: 'error',
        title: 'Error al registrar venta',
        text: errorMessage,
      });
    }
  }, [dispatch, formData, handleCloseModal, getProductInfoFromStock, stockItems]);

  const renderModalBody = useCallback(() => {
    const totalFrontend = formData.detalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);

    // Modo VIEW
    if (modalMode === MODAL_MODES.VIEW && currentVenta) {
      return (
        <div>
          <Row>
            <Col md={6}><strong>ID Venta:</strong> {currentVenta.id}</Col>
            <Col md={6}><strong>Fecha:</strong> {currentVenta.fecha?.split('T')[0]}</Col>
            <Col md={12} className="mt-3">
              <strong>Cliente:</strong> {currentVenta.cliente?.nombre_apellido || 'N/A'}
            </Col>
            <Col md={12} className="mt-3">
              <strong>Productos:</strong>
              <ul>
                {currentVenta.detalles?.map((detalle, index) => (
                  <li key={index}>
                    {detalle.producto?.nombre || 'Producto Desconocido'} -
                    {detalle.cantidad} x ${parseFloat(detalle.precio_unitario).toFixed(2)} = ${parseFloat(detalle.subtotal).toFixed(2)}
                  </li>
                ))}
              </ul>
            </Col>
            <Col md={12} className="mt-3">
              <strong>Total Venta:</strong> ${parseFloat(currentVenta.total)?.toFixed(2) || '0.00'}
            </Col>
            <Col md={12}>
              <strong>Método de Pago:</strong> {currentVenta.metodo_pago}
            </Col>
            <Col md={12}>
              <strong>Monto Pagado:</strong> ${parseFloat(currentVenta.monto_pagado)?.toFixed(2) || '0.00'}
            </Col>
            <Col md={12}>
              <strong>Monto Adeudado:</strong> ${parseFloat(currentVenta.monto_deuda)?.toFixed(2) || '0.00'}
            </Col>
          </Row>
        </div>
      );
    }

    // Modo ADD
    return (
      <Form id="modalForm" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            as="select"
            value={formData.cliente_id}
            onChange={(e) => setFormData(prev => ({ ...prev, cliente_id: e.target.value }))}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clientes?.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_apellido}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Productos</h5>
            <Button variant="success" size="sm" onClick={agregarProducto}>
              <FaPlus /> Agregar Producto
            </Button>
          </div>

          {formData.detalles.map((detalle, index) => (
            <div key={index} className="border p-3 mb-3">
              <Row className="align-items-center">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Producto</Form.Label>
                    <Form.Control
                      as="select"
                      value={detalle.producto_id}
                      onChange={(e) => actualizarDetalle(index, 'producto_id', e.target.value)}
                      required
                    >
                      <option value="">Seleccione producto</option>
                      {stockItems?.filter(item => item.unidad > 0).map(item => (
                        <option
                          key={item.producto_id}
                          value={item.producto_id}
                        >
                          {item.producto?.nombre} (Stock: {item.unidad} {item.producto?.medida})
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={detalle.cantidad}
                      onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Precio Unitario</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalle.precio_unitario}
                      onChange={(e) => actualizarDetalle(index, 'precio_unitario', e.target.value)}
                      required
                      // NOTA: 'readOnly' se ha eliminado aquí para permitir la edición manual del precio.
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarProducto(index)}
                  >
                    <FaTimes /> Eliminar
                  </Button>
                </Col>
                <Col md={12} className="mt-2 text-end">
                  <strong>Subtotal:</strong> ${parseFloat(detalle.subtotal).toFixed(2)}
                </Col>
              </Row>
            </div>
          ))}
          {formData.detalles.length > 0 && (
            <div className="h4 text-end mt-3">
              Total a pagar: ${totalFrontend.toFixed(2)}
            </div>
          )}
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Método de Pago</Form.Label>
              <Form.Control
                as="select"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handlePaymentChange}
                required
              >
                <option value="">Seleccione método</option>
                {METODOS_PAGO.map(metodo => (
                  <option key={metodo} value={metodo}>{metodo}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          {formData.metodo_pago !== 'Debe' && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Monto Pagado</Form.Label>
                <Form.Control
                  type="number"
                  name="monto_pagado"
                  min="0"
                  step="0.01" // Asegura que se puedan ingresar centavos
                  value={formData.monto_pagado}
                  onChange={handlePaymentChange}
                  required // Requerido si el método no es "Debe"
                />
              </Form.Group>
            </Col>
          )}
        </Row>

        {formData.metodo_pago === 'Debe' && totalFrontend > 0 && (
          <div className="h5 text-danger text-end mt-3">
            Adeuda: ${totalFrontend.toFixed(2)}
          </div>
        )}
        {formData.metodo_pago !== 'Debe' && totalFrontend > (parseFloat(formData.monto_pagado) || 0) && (
          <div className="h5 text-warning text-end mt-3">
            Adeuda Parcial: ${(totalFrontend - (parseFloat(formData.monto_pagado) || 0)).toFixed(2)}
          </div>
        )}
      </Form>
    );
  }, [modalMode, currentVenta, clientes, stockItems, formData, handleSubmit, agregarProducto, eliminarProducto, actualizarDetalle, handlePaymentChange]);

  return (
    <div className="ventas-page">
      <h2>Registro de Ventas</h2>
      <Button variant="primary" onClick={handleShowAddModal} className="mb-3">
        <FaPlus /> Nueva Venta
      </Button>

      {loading ? <Loader /> : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Table striped bordered hover responsive> {/* Añadido responsive para mejor visualización en pantallas pequeñas */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Método Pago</th>
              <th>Deuda</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas?.map(venta => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.fecha?.split('T')[0]}</td>
                <td>{venta.cliente?.nombre_apellido || 'N/A'}</td>
                <td>
                  {venta.detalles?.length > 0 ? (
                    <ul>
                      {venta.detalles.map((detalle, i) => (
                        <li key={i}>
                          {detalle.producto?.nombre || 'Producto Desconocido'} ({detalle.cantidad})
                        </li>
                      ))}
                    </ul>
                  ) : 'Sin detalles'}
                </td>
                <td>${parseFloat(venta.total)?.toFixed(2) || '0.00'}</td>
                <td>{venta.metodo_pago}</td>
                <td>${parseFloat(venta.monto_deuda)?.toFixed(2) || '0.00'}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowViewModal(venta)}
                    className="me-1"
                  >
                    <FaEye /> Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        show={showModal}
        handleClose={handleCloseModal}
        title={modalMode === MODAL_MODES.ADD ? 'Nueva Venta' : 'Detalles de Venta'}
        footer={
          modalMode === MODAL_MODES.ADD && (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" form="modalForm">
                Registrar Venta
              </Button>
            </>
          )
        }
      >
        {renderModalBody()}
      </Modal>
    </div>
  );
}

export default Ventas;