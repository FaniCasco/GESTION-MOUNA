// gestion/src/redux/store.js
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // Importa thunk
import rootReducer from './reducers'; // Importa tu root reducer

const initialState = {};

const middleware = [thunk]; // Middleware para manejar acciones asíncronas

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(...middleware)
  // Opcional: Agrega Redux DevTools Extension si lo usas
  //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;