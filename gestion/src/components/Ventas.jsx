// gestion/src/components/Ventas.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVentas, addVenta } from '../redux/actions/ventasActions';
import { getStock } from '../redux/actions/stockActions'; // Asumo que stockItems incluye la relación con producto
import { getClientes } from '../redux/actions/clientesActions';

import Loader from './Loader';
import Modal from './Modal';
import Button from './Button';

import { Table, Form, Row, Col} from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaEye, FaPlus, FaTimes } from 'react-icons/fa'; // Mantengo los íconos aunque editar/eliminar no estén implementados

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
  const { stockItems } = useSelector(state => state.stock); // Asegúrate que esto trae stock con { include: [{ model: Producto }] }
  const { clientes } = useSelector(state => state.clientes);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentVenta, setCurrentVenta] = useState(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    cliente_id: '',
    detalles: [], // [{ producto_id, cantidad, precio_unitario, subtotal }]
    //total: 0, // El total se calcula en el backend, aunque lo mostramos en el frontend
    metodo_pago: '', // Nuevo campo para método de pago
    monto_pagado: 0, // Nuevo campo para monto pagado
  });

  // Agregar nuevo producto al detalle
  const agregarProducto = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0 // Calculado en frontend y backend
      }]
    }));
  }, []);

  const eliminarProducto = useCallback((index) => {
    setFormData(prev => {
      const nuevosDetalles = prev.detalles.filter((_, i) => i !== index);
      // Recalcular total después de eliminar un detalle
      const nuevoTotal = nuevosDetalles.reduce((sum, item) => sum + item.subtotal, 0);

      // Ajustar monto_pagado si es mayor que el nuevo total (ej: si eliminas un producto y el monto pagado era el total anterior)
      const nuevoMontoPagado = prev.monto_pagado > nuevoTotal ? nuevoTotal : prev.monto_pagado;


      return {
        ...prev,
        detalles: nuevosDetalles,
        //total: nuevoTotal, // Ya no usamos 'total' en el estado principal para envío
        monto_pagado: nuevoMontoPagado, // Ajusta el monto pagado si excede el nuevo total
      };
    });
  }, []);

  const actualizarDetalle = useCallback((index, campo, valor) => {
    setFormData(prev => {
      const nuevosDetalles = [...prev.detalles];
      nuevosDetalles[index][campo] = valor;

      // Recalcular subtotal si cambia cantidad o precio
      if (campo === 'cantidad' || campo === 'precio_unitario') {
        const cantidad = parseFloat(nuevosDetalles[index].cantidad) || 0;
        const precio = parseFloat(nuevosDetalles[index].precio_unitario) || 0;
        nuevosDetalles[index].subtotal = cantidad * precio;
      }

      // Recalcular total de la venta
      const nuevoTotal = nuevosDetalles.reduce((sum, item) => sum + item.subtotal, 0);

      // Ajustar monto_pagado si es mayor que el nuevo total (ej: si reduces cantidad y el monto pagado era el total anterior)
      const nuevoMontoPagado = prev.monto_pagado > nuevoTotal ? nuevoTotal : prev.monto_pagado;


      return {
        ...prev,
        detalles: nuevosDetalles,
        //total: nuevoTotal, // Ya no usamos 'total' en el estado principal para envío
        monto_pagado: nuevoMontoPagado, // Ajusta el monto pagado si excede el nuevo total
      };
    });
  }, []);

  // Manejar cambios en los campos de pago
  const handlePaymentChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };

      // Si el método de pago es "Debe", el monto pagado debe ser 0
      if (name === 'metodo_pago' && value === 'Debe') {
        newState.monto_pagado = 0;
      }
      // Si el monto pagado es mayor que el total (calculado desde los detalles), ajustarlo al total
      const totalActual = newState.detalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
      if (name === 'monto_pagado' && parseFloat(value) > totalActual) {
        newState.monto_pagado = totalActual;
      }
      return newState;
    });
  }, []);


  // Fetch data inicial
  useEffect(() => {
    dispatch(getVentas());
    dispatch(getStock()); // Asegúrate que esta acción incluye el modelo Producto
    dispatch(getClientes());
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentVenta(null);
    setFormData({
      fecha: new Date().toISOString().slice(0, 10),
      cliente_id: '',
      detalles: [],
      //total: 0, // Resetear el total en el estado ya no es necesario
      metodo_pago: '', // Resetear campos de pago
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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.cliente_id || formData.detalles.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Seleccione un cliente y agregue al menos un producto',
      });
      return;
    }

    // Validar que se haya seleccionado un método de pago
    if (!formData.metodo_pago) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'Seleccione un método de pago',
      });
      return;
    }

    // Validar monto pagado si el método de pago no es "Debe"
    if (formData.metodo_pago !== 'Debe' && (parseFloat(formData.monto_pagado) <= 0 || isNaN(parseFloat(formData.monto_pagado)))) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campo Requerido',
        text: 'Ingrese un monto pagado válido',
      });
      return;
    }
    // Si el método es "Debe", asegurar que monto_pagado es 0
    if (formData.metodo_pago === 'Debe') {
      formData.monto_pagado = 0;
    }


    const ventaDataToSend = {
      fecha: formData.fecha,
      cliente_id: formData.cliente_id,
      detalles: formData.detalles.map(detalle => ({
        producto_id: parseInt(detalle.producto_id), // Asegurarse de enviar como número
        cantidad: parseFloat(detalle.cantidad), // Asegurarse de enviar como número
        precio_unitario: parseFloat(detalle.precio_unitario), // Asegurarse de enviar como número
        subtotal: parseFloat(detalle.subtotal) // Asegurarse de enviar como número
      })),
      metodo_pago: formData.metodo_pago, // Incluir método de pago
      monto_pagado: parseFloat(formData.monto_pagado) // Incluir monto pagado como número
      // El total se calcula en el backend, no lo enviamos desde aquí
    };

    // Opcional: Validar que cada detalle tenga producto, cantidad > 0 y precio > 0
    const detallesInvalidos = ventaDataToSend.detalles.some(detalle =>
      !detalle.producto_id || detalle.cantidad <= 0 || detalle.precio_unitario <= 0 || detalle.subtotal <= 0
    );

    if (detallesInvalidos) {
      MySwal.fire({
        icon: 'warning',
        title: 'Detalles Inválidos',
        text: 'Asegúrese de que cada producto tenga una cantidad y precio unitario válidos.',
      });
      return;
    }


    dispatch(addVenta(ventaDataToSend))
      .then(() => {
        MySwal.fire('Éxito', 'Venta registrada correctamente', 'success'); // Mensaje de éxito
        handleCloseModal();
        dispatch(getVentas()); // Recargar lista de ventas
        dispatch(getStock()); // Recargar stock para reflejar cambios
      })
      .catch(err => {
        // El backend ahora devuelve el mensaje de error específico
        const errorMessage = err.response && err.response.data ? err.response.data : err.message;
        MySwal.fire({
          icon: 'error',
          title: 'Error al registrar venta',
          text: errorMessage,
        });
      });
  }, [dispatch, formData, handleCloseModal]); // Dependencias actualizadas

  const renderModalBody = useCallback(() => {
    // Calcular el total en el frontend solo para mostrarlo en el formulario
    const totalFrontend = formData.detalles.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);

    // Modo VIEW
    if (modalMode === MODAL_MODES.VIEW && currentVenta) {
      return (
        <div>
          <Row>
            <Col md={6}><strong>ID Venta:</strong> {currentVenta.id}</Col>
            <Col md={6}><strong>Fecha:</strong> {currentVenta.fecha?.split('T')[0]}</Col>
            <Col md={12} className="mt-3">
              <strong>Cliente:</strong> {currentVenta.cliente?.nombre} {currentVenta.cliente?.apellido}
            </Col>
            <Col md={12} className="mt-3">
              <strong>Productos:</strong>
              <ul>
                {currentVenta.detalles?.map((detalle, index) => (
                  <li key={index}>
                    {detalle.producto?.nombre} -
                    {detalle.cantidad} x ${parseFloat(detalle.precio_unitario).toFixed(2)} = ${parseFloat(detalle.subtotal).toFixed(2)}
                  </li>
                ))}
              </ul>
            </Col>
            <Col md={12} className="mt-3">
              <strong>Total Venta:</strong> ${parseFloat(currentVenta.total)?.toFixed(2)}
            </Col>
            <Col md={12}>
              <strong>Método de Pago:</strong> {currentVenta.metodo_pago}
            </Col>
            <Col md={12}>
              <strong>Monto Pagado:</strong> ${parseFloat(currentVenta.monto_pagado)?.toFixed(2)}
            </Col>
            <Col md={12}>
              <strong>Monto Adeudado:</strong> ${parseFloat(currentVenta.monto_deuda)?.toFixed(2)}
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
                {cliente.nombre_apellido} {/* <-- Corregido aquí */}
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
                <Col md={4}> {/* Ajustado el tamaño de columna */}
                  <Form.Group>
                    <Form.Label>Producto</Form.Label>
                    <Form.Control
                      as="select"
                      value={detalle.producto_id}
                      onChange={(e) => actualizarDetalle(index, 'producto_id', e.target.value)}
                      required
                    >
                      <option value="">Seleccione producto</option>
                      {/* Asegúrate que stockItems tiene la relación 'producto' cargada */}
                      {stockItems?.filter(item => item.unidad > 0).map(item => ( // Solo mostrar productos con stock > 0
                        <option
                          key={item.producto_id}
                          value={item.producto_id}
                        >
                          {item.producto?.nombre} (Stock: {item.unidad} {item.producto?.presentacion_unidad}) {/* Muestra unidad de stock */}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={2}> {/* Ajustado el tamaño de columna */}
                  <Form.Group>
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      min="0.01" // Permitir cantidades decimales si aplica (ej: kg, lts)
                      step="0.01"
                      value={detalle.cantidad}
                      onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}> {/* Ajustado el tamaño de columna */}
                  <Form.Group>
                    <Form.Label>Precio Unitario</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalle.precio_unitario}
                      onChange={(e) => actualizarDetalle(index, 'precio_unitario', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="d-flex align-items-end"> {/* Ajustado el tamaño de columna */}
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
              Total a pagar: ${totalFrontend.toFixed(2)} {/* Mostrar total calculado en frontend */}
            </div>
          )}
        </div>

        {/* Nuevos campos para Método de Pago y Monto Pagado */}
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
          {formData.metodo_pago !== 'Debe' && ( // Mostrar monto pagado solo si el método no es "Debe"
            <Col md={6}>
              <Form.Group>
                <Form.Label>Monto Pagado</Form.Label>
                <Form.Control
                  type="number"
                  name="monto_pagado"
                  min="0"
                  step="0.01"
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
            Adeuda: ${totalFrontend.toFixed(2)} {/* Si es "Debe", muestra el total como deuda */}
          </div>
        )}
        {formData.metodo_pago !== 'Debe' && totalFrontend > (parseFloat(formData.monto_pagado) || 0) && (
          <div className="h5 text-warning text-end mt-3">
            Adeuda Parcial: ${(totalFrontend - (parseFloat(formData.monto_pagado) || 0)).toFixed(2)} {/* Muestra deuda parcial */}
          </div>
        )}


      </Form>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modalMode,
    currentVenta,
    clientes,
    stockItems, // Asegúrate que stockItems tenga la relación producto cargada
    formData,
    handleSubmit,
    handleCloseModal,
    agregarProducto,
    eliminarProducto,
    actualizarDetalle,
    handlePaymentChange, // Agregar la nueva función de manejo de pago
  ]);

  return (
    <div className="ventas-page">
      <h2>Registro de Ventas</h2>
      <Button variant="primary" onClick={handleShowAddModal} className="mb-3">
        <FaPlus /> Nueva Venta
      </Button>

      {loading ? <Loader /> : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Productos</th> {/* Quizás cambiar a "Detalles" */}
              <th>Total</th>
              <th>Método Pago</th> {/* Nuevo */}
              <th>Deuda</th> {/* Nuevo */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas?.map(venta => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.fecha?.split('T')[0]}</td>
                <td>{venta.cliente?.nombre_apellido}</td> {/* Usar nombre y apellido */}
                <td>
                  {/* Mostrar un resumen de productos */}
                  {venta.detalles?.length > 0 ? (
                    <ul>
                      {venta.detalles.map((detalle, i) => (
                        <li key={i}>
                          {detalle.producto?.nombre} ({detalle.cantidad})
                        </li>
                      ))}
                    </ul>
                  ) : 'Sin detalles'}
                </td>
                <td>${parseFloat(venta.total)?.toFixed(2)}</td>
                <td>{venta.metodo_pago}</td> {/* Mostrar método de pago */}
                <td>${parseFloat(venta.monto_deuda)?.toFixed(2)}</td> {/* Mostrar monto adeudado */}
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowViewModal(venta)}
                    className="me-1"
                  >
                    <FaEye /> Ver
                  </Button>
                  {/* Botones de editar y eliminar (inactivos por ahora) */}
                  {/* <Button variant="warning" size="sm" className="me-1" disabled><FaEdit /> Editar</Button>
                  <Button variant="danger" size="sm" disabled><FaTrash /> Eliminar</Button> */}
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