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
} from '../actions/actionTypes';

const initialState = {
  data: [],  // Cambiado de proveedores a data
  loading: false,
  error: null,
};

export default function proveedoresReducer(state = initialState, action) {
  switch (action.type) {
    case GET_PROVEEDORES_REQUEST:
    case ADD_PROVEEDOR_REQUEST:
    case UPDATE_PROVEEDOR_REQUEST:
    case DELETE_PROVEEDOR_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_PROVEEDORES_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        data: action.payload  // Ahora se guarda en data
      };

    case ADD_PROVEEDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, action.payload],
      };

    case UPDATE_PROVEEDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        data: state.data.map((prov) =>
          prov.id === action.payload.id ? action.payload : prov
        ),
      };

    case DELETE_PROVEEDOR_SUCCESS:
      return {
        ...state,
        loading: false,
        data: state.data.filter((prov) => prov.id !== action.payload),
      };

    case GET_PROVEEDORES_FAIL:
    case ADD_PROVEEDOR_FAIL:
    case UPDATE_PROVEEDOR_FAIL:
    case DELETE_PROVEEDOR_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}