// gestion/src/redux/actions/productosActions.js
import axios from 'axios';
import {
  GET_PRODUCTOS_REQUEST,
  GET_PRODUCTOS_SUCCESS,
  GET_PRODUCTOS_FAIL,
  ADD_PRODUCTO_REQUEST,
  ADD_PRODUCTO_SUCCESS,
  ADD_PRODUCTO_FAIL,
  UPDATE_PRODUCTO_REQUEST,
  UPDATE_PRODUCTO_SUCCESS,
  UPDATE_PRODUCTO_FAIL,
  DELETE_PRODUCTO_REQUEST,
  DELETE_PRODUCTO_SUCCESS,
  DELETE_PRODUCTO_FAIL,
} from './actionTypes';

const API_URL = 'http://localhost:5000/api/productos';

// Función helper para normalizar datos
const normalizarProducto = (productoData) => ({
  ...productoData,
  precio: Number(productoData.precio),
  proveedor_id: productoData.proveedor_id ? parseInt(productoData.proveedor_id) : null
});

// Acción para obtener todos los productos (CORREGIDA)
export const getProductos = () => async (dispatch) => {
  dispatch({ type: GET_PRODUCTOS_REQUEST });
  try {
    const { data } = await axios.get(API_URL); // ← Llama al endpoint del backend
    dispatch({
      type: GET_PRODUCTOS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: GET_PRODUCTOS_FAIL,
      payload: error.response?.data?.error || error.message
    });
  }
};

// Acción para añadir un nuevo producto (Corregida)
export const addProducto = (productoData) => async (dispatch) => {
  dispatch({ type: ADD_PRODUCTO_REQUEST });
  try {
    const datosNormalizados = normalizarProducto(productoData);
    const { data } = await axios.post(API_URL, datosNormalizados); // ← Faltaba esta línea

    dispatch({
      type: ADD_PRODUCTO_SUCCESS,
      payload: data // Usar la respuesta del servidor
    });

  } catch (error) {
    dispatch({
      type: ADD_PRODUCTO_FAIL,
      payload: error.response?.data?.error || error.message // Usar misma estructura de errores
    });
  }
};

// Acción para actualizar un producto (Corregida)
export const updateProducto = (productoId, productoData) => async (dispatch) => {
  dispatch({ type: UPDATE_PRODUCTO_REQUEST });
  try {
    const datosNormalizados = normalizarProducto(productoData); // ← Usar la función helper
    const { data } = await axios.put(`${API_URL}/${productoId}`, datosNormalizados);

    dispatch({
      type: UPDATE_PRODUCTO_SUCCESS,
      payload: data // Usar la respuesta del servidor
    });

  } catch (error) {
    dispatch({
      type: UPDATE_PRODUCTO_FAIL,
      payload: error.response?.data?.error || error.message
    });
  }
};

// Acción para eliminar un producto (Ya correcta)
export const deleteProducto = (productoId) => async (dispatch) => {
  dispatch({ type: DELETE_PRODUCTO_REQUEST });
  try {
    await axios.delete(`${API_URL}/${productoId}`);
    dispatch({
      type: DELETE_PRODUCTO_SUCCESS,
      payload: productoId
    });
  } catch (error) {
    dispatch({
      type: DELETE_PRODUCTO_FAIL,
      payload: error.response?.data?.error || error.message
    });
  }
};