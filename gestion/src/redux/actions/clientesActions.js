// gestion/src/redux/actions/clientesActions.js
import axios from 'axios';
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
    GET_CLIENTE_BY_ID_REQUEST,
    GET_CLIENTE_BY_ID_SUCCESS,
    GET_CLIENTE_BY_ID_FAIL,

} from './actionTypes';
const API_URL = 'http://localhost:5000/api/clientes'; // Asegúrate que coincida con tu backend // Asegúrate que coincide con el puerto y ruta de tu backend

// Acción para obtener todos los clientes
export const getClientes = () => async (dispatch) => {
    dispatch({ type: GET_CLIENTES_REQUEST });
    try {
        const { data } = await axios.get(API_URL);
        console.log('Datos recibidos (getClientes):', data); // ← Para debug
        dispatch({ type: GET_CLIENTES_SUCCESS, payload: data });
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message;
        console.error('Error en getClientes:', errorMsg); // ← Log detallado
        dispatch({ type: GET_CLIENTES_FAIL, payload: errorMsg });
    }
};

// Acción para obtener un cliente por ID (incluirá la deuda calculada desde el backend)
export const getClienteDetailsById = (clienteId) => async (dispatch) => {
    dispatch({ type: GET_CLIENTE_BY_ID_REQUEST });
    try {
        // Llama al endpoint GET /api/clientes/:id
        const { data } = await axios.get(`${API_URL}/${clienteId}`);
        console.log(`Datos recibidos (getClienteDetailsById para ID ${clienteId}):`, data); // Log para debug
        dispatch({ type: GET_CLIENTE_BY_ID_SUCCESS, payload: data });
        return data; // Opcional: retorna los datos para usarlos directamente en el componente si es necesario
    } catch (error) {
        const errorMsg = error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        console.error(`Error en getClienteDetailsById para ID ${clienteId}:`, errorMsg); // Log detallado
        dispatch({ type: GET_CLIENTE_BY_ID_FAIL, payload: errorMsg });
        throw error; // Re-lanza el error para que pueda ser manejado en el componente (ej: con .catch())
    }
};
// Acción para añadir un nuevo cliente
export const addCliente = (clienteData) => async (dispatch) => {
    dispatch({ type: ADD_CLIENTE_REQUEST });
    try {
        // Asegúrate de NO enviar el campo 'deuda' desde el frontend en addCliente
        const { data } = await axios.post(API_URL, clienteData);
        console.log('Cliente añadido:', data); // Log para debug
        dispatch({
            type: ADD_CLIENTE_SUCCESS,
            payload: data,
        });
        // Después de añadir, es buena idea recargar la lista para que aparezca el nuevo cliente
        dispatch(getClientes());
        return data; // Retorna los datos del cliente creado
    } catch (error) {
        const errorMsg = error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        console.error('Error en addCliente:', errorMsg); // Log detallado
        dispatch({
            type: ADD_CLIENTE_FAIL,
            payload: errorMsg,
        });
        throw error; // Re-lanza el error
    }
};

// Acción para actualizar un cliente existente
export const updateCliente = (clienteId, clienteData) => async (dispatch) => {
    dispatch({ type: UPDATE_CLIENTE_REQUEST });
    try {
        // Asegúrate de NO enviar el campo 'deuda' desde el frontend en updateCliente
        const { data } = await axios.put(`${API_URL}/${clienteId}`, clienteData);
        console.log(`Cliente actualizado (ID ${clienteId}):`, data); // Log para debug
        dispatch({
            type: UPDATE_CLIENTE_SUCCESS,
            payload: data, // El backend devuelve el cliente actualizado con la deuda calculada
        });
        // Después de actualizar, recargar la lista para que se reflejen los cambios
        dispatch(getClientes());
        return data; // Retorna los datos del cliente actualizado
    } catch (error) {
        const errorMsg = error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        console.error(`Error en updateCliente (ID ${clienteId}):`, errorMsg); // Log detallado
        dispatch({
            type: UPDATE_CLIENTE_FAIL,
            payload: errorMsg,
        });
        throw error; // Re-lanza el error
    }
};

// Acción para eliminar un cliente
export const deleteCliente = (clienteId) => async (dispatch) => {
    dispatch({ type: DELETE_CLIENTE_REQUEST });
    try {
        await axios.delete(`${API_URL}/${clienteId}`);
        console.log(`Cliente eliminado (ID ${clienteId})`); // Log para debug
        dispatch({
            type: DELETE_CLIENTE_SUCCESS,
            payload: clienteId, // Envía el ID del cliente eliminado
        });
    } catch (error) {
        const errorMsg = error.response && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        console.error(`Error en deleteCliente (ID ${clienteId}):`, errorMsg); // Log detallado
        dispatch({
            type: DELETE_CLIENTE_FAIL,
            payload: errorMsg,
        });
        throw error; // Re-lanza el error
    }
};