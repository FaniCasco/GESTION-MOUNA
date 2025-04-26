const Modal = ({ id, title, children, confirmText = "Confirmar", onConfirm }) => {
    return (
      <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
  
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
  
            <div className="modal-body">
              {children}
            </div>
  
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
            </div>
  
          </div>
        </div>
      </div>
    );
  };
  
  export default Modal;
  