// gestion/src/redux/reducers/clientesReducer.js
import {
    GET_CLIENTES_REQUEST,
    GET_CLIENTES_SUCCESS,
    GET_CLIENTES_FAIL,
    ADD_CLIENTE_REQUEST,
    ADD_CLIENTE_SUCCESS,
    ADD_CLIENTE_FAIL,
    UPDATE_CLIENTE_REQUEST,
    UPDATE_CLIENTE_SUCCESS,
    UPDATE_CLIENTE_FAIL,
    DELETE_CLIENTE_REQUEST,
    DELETE_CLIENTE_SUCCESS,
    DELETE_CLIENTE_FAIL,
    // Nuevos tipos de acciones para obtener un cliente por ID
    GET_CLIENTE_BY_ID_REQUEST,
    GET_CLIENTE_BY_ID_SUCCESS,
    GET_CLIENTE_BY_ID_FAIL,
    // Tipo de acción para resetear el estado del cliente seleccionado
    RESET_SELECTED_CLIENT,

} from '../actions/actionTypes'; // Asegúrate que estos tipos estén definidos

const initialState = {
    clientes: [],
    loadingList: false, // <-- Asegúrate de que se llama loadingList
    errorList: null, // <-- Asegúrate de que se llama errorList

    selectedCliente: null,
    loadingSelectedCliente: false,
    errorSelectedCliente: null,
};


export default function clientesReducer(state = initialState, action) {
    switch (action.type) {
        // Acciones para obtener la lista de clientes
        case GET_CLIENTES_REQUEST:
            return { ...state, loadingList: true, errorList: null }; // Usa loadingList

        case GET_CLIENTES_SUCCESS:
            return { ...state, loadingList: false, clientes: action.payload, errorList: null }; // Usa loadingList

        case GET_CLIENTES_FAIL:
            return { ...state, loadingList: false, errorList: action.payload };

        // Acciones para obtener un cliente individual por ID
        case GET_CLIENTE_BY_ID_REQUEST:
            return {
                ...state,
                loadingSelectedCliente: true, // Carga del cliente individual
                errorSelectedCliente: null,
                selectedCliente: null, // Limpiar el cliente seleccionado anterior al iniciar la carga
            };

        case GET_CLIENTE_BY_ID_SUCCESS:
            return {
                ...state,
                loadingSelectedCliente: false,
                selectedCliente: action.payload, // El cliente individual recibido
                errorSelectedCliente: null,
            };

        case GET_CLIENTE_BY_ID_FAIL:
            return {
                ...state,
                loadingSelectedCliente: false,
                errorSelectedCliente: action.payload,
                selectedCliente: null, // Limpiar el cliente seleccionado en caso de error
            };

        // Acción para resetear el estado del cliente seleccionado
        case RESET_SELECTED_CLIENT:
            return {
                ...state,
                selectedCliente: null,
                loadingSelectedCliente: false,
                errorSelectedCliente: null,
            };


        // Acciones para añadir un cliente
        case ADD_CLIENTE_REQUEST:
            return {
                ...state,
                loadingList: true, // Podrías usar loadingList o un loading general si prefieres
                errorList: null,
            };

        case ADD_CLIENTE_SUCCESS:
            // Si la lista se recarga después de añadir (como sugerimos en la acción),
            // el payload de GET_CLIENTES_SUCCESS actualizará la lista.
            // Si no recargas la lista, podrías agregar el cliente aquí:
            return {
                ...state,
                loadingList: false,
                // clientes: [...state.clientes, action.payload], // Solo si no recargas la lista
                errorList: null,
            };

        case ADD_CLIENTE_FAIL:
            return {
                ...state,
                loadingList: false, // O loading general
                errorList: action.payload,
            };


        // Acciones para actualizar un cliente
        case UPDATE_CLIENTE_REQUEST:
            return {
                ...state,
                loadingList: true, // Podrías usar loadingList o un loading general
                errorList: null,
            };

        case UPDATE_CLIENTE_SUCCESS:
            // Si la lista se recarga después de actualizar (como sugerimos en la acción),
            // el payload de GET_CLIENTES_SUCCESS actualizará la lista.
            // Si no recargas, podrías actualizar el cliente en la lista:
            return {
                ...state,
                loadingList: false,
                // clientes: state.clientes.map((cliente) =>
                //   cliente.id === action.payload.id ? action.payload : cliente // action.payload es el cliente actualizado con deuda
                // ), // Solo si no recargas la lista
                errorList: null,
            };

        case UPDATE_CLIENTE_FAIL:
            return {
                ...state,
                loadingList: false, // O loading general
                errorList: action.payload,
            };

        // Acciones para eliminar un cliente
        case DELETE_CLIENTE_REQUEST:
            return {
                ...state,
                loadingList: true, // Podrías usar loadingList o un loading general
                errorList: null,
            };

        case DELETE_CLIENTE_SUCCESS:
            // Filtra la lista para quitar el cliente eliminado.
            return {
                ...state,
                loadingList: false,
                clientes: state.clientes.filter(
                    (cliente) => cliente.id !== action.payload // action.payload debe ser el ID
                ),
                errorList: null,
            };

        case DELETE_CLIENTE_FAIL:
            return {
                ...state,
                loadingList: false, // O loading general
                errorList: action.payload,
            };


        default:
            return state;
    }
}
// Necesitarás crear archivos de reducers similares para productos, proveedores, ventas, stock.