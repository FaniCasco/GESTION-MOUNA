// gestion/src/components/Proveedores.jsx
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  getProveedores,
  addProveedor,
  updateProveedor,
  deleteProveedor,
} from '../redux/actions/proveedoresActions';
import '../Proveedores.css';

const Proveedores = ({
  proveedores,
  loading,
  error,
  getProveedores,
  addProveedor,
  updateProveedor,
  deleteProveedor,
}) => {
  const [formData, setFormData] = useState({
    empresa: '',
    telefono: '',
    cbu: '',
    ciudad: '',
    direccion: '',
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getProveedores();
  }, [getProveedores]);

  useEffect(() => {
    if (!showForm) {
      setFormData({ empresa: '', telefono: '', cbu: '', ciudad: '', direccion: '' });
      setEditId(null);
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.empresa || !formData.telefono) {
      alert('Los campos Empresa y Teléfono son obligatorios');
      return;
    }

    try {
      const proveedorData = {
        ...formData,
        telefono: formData.telefono.toString()
      };

      if (editId) {
        await updateProveedor(editId, proveedorData);
      } else {
        await addProveedor(proveedorData);
      }

      // Actualizar lista y resetear formulario
      await getProveedores();
      setShowForm(false);

    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEdit = (prov) => {
    setFormData(prov);
    setEditId(prov.id);
    setShowForm(true);
  };

  return (
    <div className="proveedores-container">
      <div className="header-section">
        <h1 className="titulo-principal">Gestión de Proveedores</h1>
        <button 
          className={`btn ${showForm ? 'btn-danger' : 'btn-success'} btn-lg`}
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '✖ Cancelar' : '➕ Nuevo Proveedor'}
        </button>
      </div>

      {showForm && (
        <div className="formulario-section card mt-4 animate__animated animate__fadeIn">
          <div className="card-body">
            <h2 className="titulo-seccion-formulario mb-4">
              {editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Nombre de la Empresa <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control input-moderno"
                      placeholder="Ej: Distribuciones S.A."
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>Teléfono <span className="required">*</span></label>
                    <input
                      type="tel"
                      className="form-control input-moderno"
                      placeholder="Ej: 549-341-1234567"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>CBU/CVU</label>
                    <input
                      type="text"
                      className="form-control input-moderno"
                      placeholder="Ej: 00000000000000000000"
                      value={formData.cbu}
                      onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      className="form-control input-moderno"
                      placeholder="Ej: Rosario"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      className="form-control input-moderno"
                      placeholder="Ej: Av. Pellegrini 1234"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg accion-principal"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : editId ? (
                      '💾 Guardar Cambios'
                    ) : (
                      '📤 Registrar Proveedor'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alerta-error mt-4">
          ⚠️ Error: {error.message || error}
        </div>
      )}

      <div className="listado-section card mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="titulo-seccion-listado mb-0">📋 Listado de Proveedores</h2>
            <small className="text-muted">
              {proveedores.length} proveedores registrados
            </small>
          </div>

          {!loading && proveedores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p className="empty-state-text">No hay proveedores registrados</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Agregar primer proveedor
              </button>
            </div>
          ) : (
            <div className="listado-proveedores">
              {proveedores.map((prov) => (
                <div key={prov.id} className="proveedor-item card mb-3">
                  <div className="card-body">
                    <div className="proveedor-header">
                      <span className="proveedor-id badge bg-secondary">
                        ID: {prov.id}
                      </span>
                      <h3 className="proveedor-nombre mt-2">{prov.empresa}</h3>
                    </div>

                    <div className="proveedor-detalles mt-3">
                      <div className="detalle-item">
                        <span className="detalle-icono">📞</span>
                        <span className="detalle-texto">{prov.telefono}</span>
                      </div>
                      
                      {prov.ciudad && (
                        <div className="detalle-item">
                          <span className="detalle-icono">📍</span>
                          <span className="detalle-texto">{prov.ciudad}</span>
                        </div>
                      )}
                      
                      {prov.direccion && (
                        <div className="detalle-item">
                          <span className="detalle-icono">🏢</span>
                          <span className="detalle-texto">{prov.direccion}</span>
                        </div>
                      )}
                    </div>

                    <div className="proveedor-acciones mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm accion-editar"
                        onClick={() => handleEdit(prov)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm accion-eliminar ms-2"
                        onClick={() => {
                          if(window.confirm('¿Confirmar eliminación?')) {
                            deleteProveedor(prov.id);
                          }
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  proveedores: state.proveedores.data || [],
  loading: state.proveedores.loading,
  error: state.proveedores.error
});

export default connect(mapStateToProps, {
  getProveedores,
  addProveedor,
  updateProveedor,
  deleteProveedor,
})(Proveedores);