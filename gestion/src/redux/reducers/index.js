// gestion/src/redux/reducers/index.js
import { combineReducers } from 'redux';
import clientesReducer from './clientesReducer';
import productosReducer from './productosReducer'; 
import stockReducer from './stockReducer'; 
import ventasReducer from './ventasReducer';
import proveedoresReducer from './proveedoresReducer';


const rootReducer = combineReducers({
  clientes: clientesReducer,
  productos: productosReducer,
  stock: stockReducer,
  ventas: ventasReducer, // Agrega el reducer de stock aquí
  proveedores: proveedoresReducer,
  // 
});

export default rootReducer;