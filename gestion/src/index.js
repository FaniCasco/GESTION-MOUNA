// gestion/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Estilos generales
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store'; // Importa tu store de Redux

import { BrowserRouter as Router } from 'react-router-dom'; // Importa BrowserRouter

import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* Envuelve tu App con el Provider de Redux */}
      <Router> {/* Envuelve tu App con el Router de React Router Dom */}
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);

