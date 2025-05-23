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
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';

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
      <div className="header-section header-proveedores">
        <h1 className="titulo-principal">Gestión de Proveedores</h1>
        <button
          className={`btn ${showForm ? 'btn-cancelar-moderno' : 'btn-primario-moderno'}`}
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus-circle'} me-2`}></i>
          {showForm ? 'Cancelar' : 'Agregar Proveedor'}
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
                    <label>CBU/CVU/ALIAS</label>
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
            <h3 className="titulo-seccion-listado mb-0">
              <i className="fas fa-clipboard-list me-2"></i>Listado de Proveedores
            </h3>
            <small className="text-muted badge bg-light text-dark">
              Registrados: {proveedores.length}
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
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">ID</th>
                    <th scope="col" className="ps-4">Empresa</th>
                    <th scope="col" className="ps-4">Teléfono</th>
                    <th scope="col" className="ps-4">Ubicación</th>
                    <th scope="col" className="ps-4">Dirección</th>
                    <th scope="col" className="ps-4">Cbu/Cvu/Alias</th>
                    <th scope="col" className="pe-4 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((prov) => (
                    <tr key={prov.id} className="proveedor-row">
                      {/* ID */}
                      <td className="ps-4 fw-medium text-primary">#{prov.id}</td>

                      {/* Empresa */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="icon-circle bg-primary text-white">
                            <i className="fas fa-building"></i>
                          </div>
                          <span className="fw-medium">{prov.empresa}</span>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-phone text-muted"></i>
                          {prov.telefono}
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td className="ps-4">
                        {prov.ciudad && (
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-map-marker-alt text-danger"></i>
                            {prov.ciudad}
                          </div>
                        )}
                      </td>

                      {/* Dirección */}
                      <td className="ps-4">
                        {prov.direccion && (
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-map-pin text-success"></i>
                            {prov.direccion}
                          </div>
                        )}
                      </td>

                      {/* CBU */}
                      <td className="ps-4">
                        {prov.cbu && (
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-university text-success"></i>
                            <span className="font-monospace">{prov.cbu}</span>
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="pe-4 text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleEdit(prov)}
                            className="me-1"
                          >
                            <FaEdit className="text-white" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('¿Confirmar eliminación?')) {
                                deleteProveedor(prov.id);
                              }
                            }}
                          >
                            <FaTrash className="text-white" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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