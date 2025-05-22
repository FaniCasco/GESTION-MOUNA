// gestion/src/redux/reducers/stockReducer.js
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
} from '../actions/actionTypes';

const initialState = {
  stockItems: [], // Lista de registros de stock
  loading: false,
  error: null,
};

export default function stockReducer(state = initialState, action) {
  switch (action.type) {
    case GET_STOCK_REQUEST:
    case ADD_STOCK_REQUEST:
    case UPDATE_STOCK_REQUEST:
    case DELETE_STOCK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null, // Limpiar errores anteriores
      };

    case GET_STOCK_SUCCESS:
      return {
        ...state,
        loading: false,
        stockItems: action.payload, // Carga la lista de registros de stock
        error: null,
      };

    case ADD_STOCK_SUCCESS:
        // Cuando añades o sumas stock (desde la acción POST addOrUpdateStock),
        // el payload es el registro de stock actualizado o recién creado.
        // Buscamos si ya existe en la lista por su ID y lo reemplazamos, o lo añadimos si es nuevo.
       const existingStockIndex = state.stockItems.findIndex(item => item.id === action.payload.id);

       if (existingStockIndex > -1) {
         // Si el registro de stock ya existía (el backend sumó), reemplazamos el antiguo
         const updatedStockItems = [...state.stockItems];
         updatedStockItems[existingStockIndex] = action.payload;
         return {
           ...state,
           loading: false,
           stockItems: updatedStockItems,
           error: null,
         };
       } else {
         // Si se creó un nuevo registro de stock (el producto no tenía stock previo)
         return {
           ...state,
           loading: false,
           stockItems: [...state.stockItems, action.payload],
           error: null,
         };
       }


    case UPDATE_STOCK_SUCCESS:
      // Cuando actualizas un registro específico de stock (desde la acción PUT updateStockEntry),
      // reemplazas el registro antiguo en la lista con el actualizado.
      return {
        ...state,
        loading: false,
        stockItems: state.stockItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        error: null,
      };

    case DELETE_STOCK_SUCCESS:
      // Cuando eliminas un registro de stock, filtra la lista
      return {
        ...state,
        loading: false,
        stockItems: state.stockItems.filter(
          (item) => item.id !== action.payload // action.payload es el ID del registro eliminado
        ),
        error: null,
      };

    case GET_STOCK_FAIL:
    case ADD_STOCK_FAIL:
    case UPDATE_STOCK_FAIL:
    case DELETE_STOCK_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload, // El payload contiene el mensaje de error
      };

    default:
      return state;
  }
}