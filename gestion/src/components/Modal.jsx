// gestion/src/components/Modal.jsx
import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';

function Modal({ show, handleClose, title, children, footer, size = 'md' }) {
  return (
    <BootstrapModal show={show} onHide={handleClose} size={size}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      {footer && <BootstrapModal.Footer>{footer}</BootstrapModal.Footer>}
    </BootstrapModal>
  );
}

export default Modal;