// gestion/src/components/Stock.jsx
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStock, addOrUpdateStock, updateStockEntry, deleteStock } from '../redux/actions/stockActions';
//import { getProductos } from '../redux/actions/productosActions';

import Loader from './Loader';
import Modal from './Modal';
import Button from './Button';

import { Table, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // <-- Importación corregida

import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const MODAL_MODES = {
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
};

function Stock() {
  // --- TODAS LAS LLAMADAS A HOOKS DEBEN ESTAR AQUÍ AL PRINCIPIO Y SER INCONDICIONALES ---
  const dispatch = useDispatch();
  const { stockItems, loading, error } = useSelector(state => state.stock); // Primer useSelector
  // Mueve los otros useSelector al principio también
  const { productos } = useSelector(state => state.productos);
  const productosLoading = useSelector(state => state.productos.loading); // Obtener loading de productos
  const productosError = useSelector(state => state.productos.error); // Obtener error de productos


  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(MODAL_MODES.ADD);
  const [currentStockItem, setCurrentStockItem] = useState(null);

  const [formData, setFormData] = useState({
    producto_id: '',
    unidad: 0,
  });

  // Define todos tus useCallback aquí después de los useState
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  }, []);


  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setCurrentStockItem(null);
     setFormData({
       producto_id: '',
       unidad: 0,
     });
  }, []);


  const handleShowAddModal = useCallback(() => {
    setModalMode(MODAL_MODES.ADD);
    setCurrentStockItem(null);
    setFormData({
      producto_id: '',
      unidad: 0,
    });
    setShowModal(true);
  }, []);


  const handleShowViewModal = useCallback((stockItem) => {
      setModalMode(MODAL_MODES.VIEW);
      setCurrentStockItem(stockItem);
       setFormData({
         producto_id: stockItem.producto_id,
         unidad: stockItem.unidad,
       });
      setShowModal(true);
  }, []);


  const handleShowEditModal = useCallback((stockItem) => {
    setModalMode(MODAL_MODES.EDIT);
    setCurrentStockItem(stockItem);
    setFormData({
      producto_id: stockItem.producto_id,
      unidad: stockItem.unidad,
    });
    setShowModal(true);
  }, []);


  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!formData.producto_id || formData.unidad === undefined || parseFloat(formData.unidad) < 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Debe seleccionar un Producto y la Unidad no puede ser negativa.',
      });
      return;
    }

     const stockDataToSend = {
       ...formData,
       unidad: parseFloat(formData.unidad)
     };

    const handleSuccess = () => {
      handleCloseModal();
      dispatch(getStock());
    };

    const handleError = (err) => {
      MySwal.fire({
        icon: 'error',
        title: `Error al ${modalMode === MODAL_MODES.EDIT ? 'Actualizar' : 'Añadir Stock'}`,
        text: `Hubo un problema: ${err}`,
      });
    };

    if (modalMode === MODAL_MODES.EDIT && currentStockItem) {
      dispatch(updateStockEntry(currentStockItem.id, stockDataToSend))
        .then(handleSuccess)
        .catch(handleError);
    } else if (modalMode === MODAL_MODES.ADD) {
      dispatch(addOrUpdateStock(stockDataToSend))
        .then(handleSuccess)
        .catch(handleError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, formData, modalMode, currentStockItem, handleCloseModal, getStock, addOrUpdateStock, updateStockEntry]);


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
        dispatch(deleteStock(stockId))
           .then(() => {
             MySwal.fire(
               '¡Eliminado!',
               'El registro de stock ha sido eliminado.',
               'success'
             );
           })
          .catch((err) => {
             MySwal.fire(
               'Error',
               `Hubo un problema al eliminar el stock: ${err}`,
               'error'
             );
          });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, deleteStock]);


   const getModalTitle = useCallback(() => {
     switch (modalMode) {
       case MODAL_MODES.ADD:
         return 'Añadir Stock';
       case MODAL_MODES.EDIT:
         return 'Editar Stock';
       case MODAL_MODES.VIEW:
         return 'Detalles de Stock';
       default:
         return 'Stock';
     }
   }, [modalMode]);


     const renderModalBody = useCallback(() => {
       if (modalMode === MODAL_MODES.VIEW && currentStockItem) {
         const productoAsociado = productos.find(p => p.id === currentStockItem.producto_id);
         return (
           <div>
              <Row>
                  <Col md={6}><p><strong>ID Registro Stock:</strong> {currentStockItem.id}</p></Col>
                  <Col md={6}><p><strong>Producto ID:</strong> {currentStockItem.producto_id}</p></Col>
                  <Col md={12}><p><strong>Producto:</strong> {productoAsociado ? `${productoAsociado.nombre} (${productoAsociado.codigo})` : 'Cargando...'}</p></Col>
                  <Col md={12}><p><strong>Unidad en Stock:</strong> {currentStockItem.unidad !== null && currentStockItem.unidad !== undefined ? parseFloat(currentStockItem.unidad).toFixed(2) : '0.00'}</p></Col>
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
                 <option key={producto.id} value={producto.id}>
                   {`${producto.nombre} (${producto.codigo})`}
                 </option>
               ))}
             </Form.Control>
             {productos && productos.length === 0 && (
                 <Form.Text className="text-danger">
                   No hay productos disponibles. Agregue productos primero.
                 </Form.Text>
              )}
           </Form.Group>

           <Form.Group className="mb-3">
             <Form.Label>Unidad en Stock</Form.Label>
             <Form.Control
               type="number"
               name="unidad"
               value={formData.unidad}
               onChange={handleInputChange}
               step="0.01"
               min={modalMode === MODAL_MODES.ADD ? "0" : "0"}
               required
             />
              {modalMode === MODAL_MODES.ADD && <Form.Text muted>Si el producto ya tiene stock, esta cantidad se sumará al total existente.</Form.Text>}
           </Form.Group>

         </Form>
       );
     }, [modalMode, currentStockItem, productos, formData, handleInputChange, handleSubmit]);


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
                       {modalMode === MODAL_MODES.EDIT ? 'Actualizar Stock' : 'Añadir Stock'}
                   </Button>
               </>
           );
       }
   }, [modalMode, handleCloseModal]);

   // Calcula el estado de carga total después de obtener los estados individuales
   const isPageLoading = loading || productosLoading; // Usa el estado de loading de productos también

  // --- CONDICIONALES DE RENDERIZADO TEMPRANO (DESPUÉS DE TODOS LOS HOOKS) ---
  if (isPageLoading) {
    return <Loader />;
  }

  // Mostrar mensaje de error si hay uno (prioriza errores de stock si ambos existen)
  if (error) {
    return <div className="alert alert-danger">Error al cargar stock: {error}</div>;
  }
   if (productosError) {
       return <div className="alert alert-danger">Error al cargar productos para selector: {productosError}</div>;
   }


  // --- RENDERIZADO NORMAL SI NO HAY CARGA NI ERRORES ---
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
              <th>Unidad en Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.producto_id}</td>
                <td>{item.producto ? item.producto.codigo : 'Cargando...'}</td>
                <td>{item.producto ? item.producto.nombre : 'Cargando...'}</td>
                <td>{item.unidad !== null && item.unidad !== undefined ? parseFloat(item.unidad).toFixed(2) : '0.00'}</td>
                <td>
                   <Button
                     variant="info"
                     size="sm"
                     onClick={() => handleShowViewModal(item)}
                     className="me-1"
                   >
                     <FaEye /> Ver
                   </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleShowEditModal(item)}
                    className="me-1"
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteStock(item.id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
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