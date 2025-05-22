// gestion/src/redux/actions/ventasActions.js
import axios from 'axios';
import {
  GET_VENTAS_REQUEST,
  GET_VENTAS_SUCCESS,
  GET_VENTAS_FAIL,
  ADD_VENTA_REQUEST,
  ADD_VENTA_SUCCESS,
  ADD_VENTA_FAIL,
  UPDATE_VENTA_REQUEST,
  UPDATE_VENTA_SUCCESS,
  UPDATE_VENTA_FAIL,
  DELETE_VENTA_REQUEST,
  DELETE_VENTA_SUCCESS,
  DELETE_VENTA_FAIL,
} from './actionTypes';

// URL base de tu API backend para ventas
const API_URL = 'http://localhost:5000/api/ventas'; // ASEGÚRATE que esta URL es correcta para tu backend

// Acción para obtener todas las ventas (el backend debería incluir asociaciones)
export const getVentas = () => async (dispatch) => {
  dispatch({ type: GET_VENTAS_REQUEST });
  try {
    const { data } = await axios.get(API_URL);
    dispatch({
      type: GET_VENTAS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_VENTAS_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};

// Acción para registrar una nueva venta (el backend maneja la actualización de stock)
export const addVenta = (ventaData) => async (dispatch) => {
  dispatch({ type: ADD_VENTA_REQUEST });
  try {
    // ventaData debe incluir al menos cliente_id, producto_id, unidad y total
    // El backend en /api/ventas (POST) espera esta data y se encarga de descontar el stock
    const { data } = await axios.post(API_URL, ventaData);
    dispatch({
      type: ADD_VENTA_SUCCESS,
      payload: data, // El backend debería devolver la venta creada (posiblemente con asociaciones)
    });
    // Después de un registro exitoso, es buena práctica recargar la lista de ventas para reflejar el cambio
    // También podrías querer recargar el stock en la página de ventas o en la página de stock si estás allí
    dispatch(getVentas());
    // Si estás en la página de Ventas, y quieres que el Stock visible se actualice:
    // import { getStock } from './stockActions';
    // dispatch(getStock());

  } catch (error) {
    dispatch({
      type: ADD_VENTA_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
     // Aquí puedes añadir lógica para mostrar un SweetAlert si falla la operación
  }
};

// Acción para actualizar una venta existente (NOTA: Backend no implementa ajuste de stock automático)
export const updateVenta = (ventaId, ventaData) => async (dispatch) => {
  dispatch({ type: UPDATE_VENTA_REQUEST });
  try {
    // Esta acción solo actualizará los datos de la venta en el backend,
    // SIN ajustar el stock debido a la complejidad de esta operación.
    const { data } = await axios.put(`${API_URL}/${ventaId}`, ventaData);
    dispatch({
      type: UPDATE_VENTA_SUCCESS,
      payload: data, // El backend debería devolver la venta actualizada
    });
    // Recargar la lista después de actualizar
    dispatch(getVentas());
  } catch (error) {
    dispatch({
      type: UPDATE_VENTA_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
     // Mostrar SweetAlert si falla
  }
};

// Acción para eliminar una venta (NOTA: Backend no implementa reversión de stock automático)
export const deleteVenta = (ventaId) => async (dispatch) => {
  dispatch({ type: DELETE_VENTA_REQUEST });
  try {
    // Esta acción solo eliminará el registro de venta en el backend,
    // SIN revertir el stock debido a la complejidad de esta operación.
    await axios.delete(`${API_URL}/${ventaId}`);
    dispatch({
      type: DELETE_VENTA_SUCCESS,
      payload: ventaId, // Envía el ID de la venta eliminada para que el reducer la quite del estado
    });
    // La lista se actualizará automáticamente si el reducer maneja DELETE_VENTA_SUCCESS correctamente
    // Si el reducer no la elimina, podrías recargar la lista aquí: dispatch(getVentas());
  } catch (error) {
    dispatch({
      type: DELETE_VENTA_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
     // Mostrar SweetAlert si falla
  }
};