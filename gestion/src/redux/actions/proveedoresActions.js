// gestion/src/redux/actions/proveedoresActions.js
import axios from 'axios';
import {
  GET_PROVEEDORES_REQUEST,
  GET_PROVEEDORES_SUCCESS,
  GET_PROVEEDORES_FAIL,
  ADD_PROVEEDOR_REQUEST,
  ADD_PROVEEDOR_SUCCESS,
  ADD_PROVEEDOR_FAIL,
  UPDATE_PROVEEDOR_REQUEST,
  UPDATE_PROVEEDOR_SUCCESS,
  UPDATE_PROVEEDOR_FAIL,
  DELETE_PROVEEDOR_REQUEST,
  DELETE_PROVEEDOR_SUCCESS,
  DELETE_PROVEEDOR_FAIL,
} from './actionTypes';

const API_URL = 'http://localhost:5000/api/proveedores';

export const getProveedores = () => async (dispatch) => {
  dispatch({ type: GET_PROVEEDORES_REQUEST });
  try {
    const response = await axios.get(API_URL);  // Usar API_URL completa
    dispatch({ 
      type: GET_PROVEEDORES_SUCCESS, 
      payload: response.data 
    });
  } catch (error) {
    const errorMsg = error.response?.data?.message || 
                    error.message || 
                    'Error desconocido';
    dispatch({ type: GET_PROVEEDORES_FAIL, payload: errorMsg });
  }
};

// Agregar nuevo proveedor
export const addProveedor = (proveedorData) => async (dispatch) => {
  dispatch({ type: ADD_PROVEEDOR_REQUEST });
  try {
    const { data } = await axios.post(API_URL, proveedorData);
    dispatch({ type: ADD_PROVEEDOR_SUCCESS, payload: data });
    dispatch(getProveedores()); // Recargar lista
  } catch (error) {
    dispatch({
      type: ADD_PROVEEDOR_FAIL,
      payload: error.response?.data?.msg || error.message,
    });
  }
};

// Actualizar proveedor
export const updateProveedor = (id, proveedorData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROVEEDOR_REQUEST });
  try {
    const { data } = await axios.put(`${API_URL}/${id}`, proveedorData);
    dispatch({ type: UPDATE_PROVEEDOR_SUCCESS, payload: data });
    dispatch(getProveedores());
  } catch (error) {
    dispatch({
      type: UPDATE_PROVEEDOR_FAIL,
      payload: error.response?.data?.msg || error.message,
    });
  }
};

// Eliminar proveedor
export const deleteProveedor = (id) => async (dispatch) => {
  dispatch({ type: DELETE_PROVEEDOR_REQUEST });
  try {
    await axios.delete(`${API_URL}/${id}`);
    dispatch({ type: DELETE_PROVEEDOR_SUCCESS, payload: id });
  } catch (error) {
    dispatch({
      type: DELETE_PROVEEDOR_FAIL,
      payload: error.response?.data?.msg || error.message,
    });
  }
};