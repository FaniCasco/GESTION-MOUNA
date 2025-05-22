// gestion/src/redux/reducers/productosReducer.js
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
} from '../actions/actionTypes';

const initialState = {
  data: [], 
  loading: false,
  error: null
};

export default function productosReducer(state = initialState, action) {
  switch (action.type) {
    case GET_PRODUCTOS_REQUEST:
    case ADD_PRODUCTO_REQUEST:
    case UPDATE_PRODUCTO_REQUEST:
    case DELETE_PRODUCTO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PRODUCTOS_SUCCESS:
      return {
        ...state,
        data: action.payload,  // ← Cambia aquí
        loading: false,
        error: null
      };

    case ADD_PRODUCTO_SUCCESS:
      return {
        ...state,
        data: [...state.data, action.payload],  // ← Y aquí
        loading: false,
        error: null
      };

    case UPDATE_PRODUCTO_SUCCESS:
      return {
        ...state,
        data: state.data.map(producto =>  // ← Y aquí
          producto.id === action.payload.id ? action.payload : producto
        ),
        loading: false,
        error: null
      };

    case DELETE_PRODUCTO_SUCCESS:
      return {
        ...state,
        data: state.data.filter(  // ← Y aquí
          producto => producto.id !== action.payload
        ),
        loading: false,
        error: null
      };

    case GET_PRODUCTOS_FAIL:
    case ADD_PRODUCTO_FAIL:
    case UPDATE_PRODUCTO_FAIL:
    case DELETE_PRODUCTO_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}