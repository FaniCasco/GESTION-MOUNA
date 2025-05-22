// gestion/src/redux/actions/stockActions.js
import axios from 'axios';
import {
  GET_STOCK_REQUEST,
  GET_STOCK_SUCCESS,
  GET_STOCK_FAIL,
  ADD_STOCK_REQUEST,
  ADD_STOCK_SUCCESS,
  ADD_STOCK_FAIL,
  UPDATE_STOCK_REQUEST,
  UPDATE_STOCK_SUCCESS,
  UPDATE_STOCK_FAIL,
  DELETE_STOCK_REQUEST,
  DELETE_STOCK_SUCCESS,
  DELETE_STOCK_FAIL,
} from './actionTypes';

// URL base de tu API backend para stock
const API_URL = 'http://localhost:5000/api/stock'; // Asegúrate que coincide con tu backend

// Acción para obtener todo el stock (incluye info de producto gracias al backend)
export const getStock = () => async (dispatch) => {
  dispatch({ type: GET_STOCK_REQUEST });
  try {
    const { data } = await axios.get(API_URL);
    dispatch({
      type: GET_STOCK_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_STOCK_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};

// Acción para añadir stock o sumar a stock existente (Usa el endpoint POST del backend)
export const addOrUpdateStock = (stockData) => async (dispatch) => {
  dispatch({ type: ADD_STOCK_REQUEST });
  try {
    // El backend createStock (POST) está diseñado para añadir o sumar unidades si el producto ya tiene stock.
    const { data } = await axios.post(API_URL, stockData);
    dispatch({
      type: ADD_STOCK_SUCCESS, // Indica éxito al añadir o sumar
      payload: data, // El backend debería devolver el registro de stock actualizado/creado
    });
    // Opcional: podrías querer recargar la lista de stock después de añadir/sumar
    // dispatch(getStock());
  } catch (error) {
    dispatch({
      type: ADD_STOCK_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};

// Acción para actualizar un registro de stock existente (Usa el endpoint PUT del backend)
// Esta acción es para modificar un registro específico, no para sumar cantidades.
// El backend PUT actual no tiene la lógica de suma.
export const updateStockEntry = (stockId, stockData) => async (dispatch) => {
  dispatch({ type: UPDATE_STOCK_REQUEST });
  try {
    const { data } = await axios.put(`${API_URL}/${stockId}`, stockData);
    dispatch({
      type: UPDATE_STOCK_SUCCESS,
      payload: data, // El backend debería devolver el registro actualizado
    });
    // Opcional: recargar la lista
    // dispatch(getStock());
  } catch (error) {
    dispatch({
      type: UPDATE_STOCK_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};


// Acción para eliminar un registro de stock
export const deleteStock = (stockId) => async (dispatch) => {
  dispatch({ type: DELETE_STOCK_REQUEST });
  try {
    await axios.delete(`${API_URL}/${stockId}`);
    dispatch({
      type: DELETE_STOCK_SUCCESS,
      payload: stockId, // Envía el ID del registro de stock eliminado
    });
    // Opcional: recargar la lista o eliminar el registro del estado
    // dispatch(getStock());
  } catch (error) {
    dispatch({
      type: DELETE_STOCK_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};