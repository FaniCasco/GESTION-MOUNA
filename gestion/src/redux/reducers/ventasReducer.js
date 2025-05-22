// gestion/src/redux/reducers/ventasReducer.js
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
} from '../actions/actionTypes';

const initialState = {
  ventas: [], // Lista de registros de ventas
  loading: false,
  error: null,
  // Puedes añadir un estado para la venta seleccionada si lo necesitas para edición/vista detallada
  // selectedVenta: null
};

export default function ventasReducer(state = initialState, action) {
  switch (action.type) {
    case GET_VENTAS_REQUEST:
    case ADD_VENTA_REQUEST:
    case UPDATE_VENTA_REQUEST:
    case DELETE_VENTA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Limpiar errores anteriores al iniciar una nueva petición
      };

    case GET_VENTAS_SUCCESS:
      return {
        ...state,
        loading: false,
        ventas: action.payload, // El payload es la lista de ventas
        error: null,
      };

    case ADD_VENTA_SUCCESS:
      // Cuando añades una venta (POST), el backend devuelve la venta creada.
      // La agregamos al estado.
      return {
        ...state,
        loading: false,
        ventas: [...state.ventas, action.payload],
        error: null,
      };

    case UPDATE_VENTA_SUCCESS:
      // Cuando actualizas una venta (PUT), el backend devuelve la venta actualizada.
      // Reemplazamos la venta antigua en la lista con la nueva.
      return {
        ...state,
        loading: false,
        ventas: state.ventas.map((venta) =>
          venta.id === action.payload.id ? action.payload : venta
        ),
        error: null,
      };

    case DELETE_VENTA_SUCCESS:
      // Cuando eliminas una venta (DELETE), el payload es el ID de la venta eliminada.
      // Filtramos la lista para quitar esa venta.
      return {
        ...state,
        loading: false,
        ventas: state.ventas.filter(
          (venta) => venta.id !== action.payload
        ),
        error: null,
      };

    case GET_VENTAS_FAIL:
    case ADD_VENTA_FAIL:
    case UPDATE_VENTA_FAIL:
    case DELETE_VENTA_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload, // El payload contiene el mensaje de error
      };

    default:
      return state;
  }
}