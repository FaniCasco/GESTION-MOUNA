// components/Footer.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaFacebook, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import '../Footer.css';

const Footer = () => {
    return (
        <footer className="footer-pastel pastel-pink-light">
            <Container>
                <Row className="footer-row align-items-center">
                    {/* Columna Contacto */}
                    <Col md={4} className="footer-col contact-col">
                        <h5 className="footer-title mb-3">Contacto</h5>
                        <div className="footer-contact d-flex justify-content-center align-items-center">
                            <FaPhoneAlt className="me-2" />
                            <p className="mb-0">+54 9 3471 31-4419</p>
                        </div>
                    </Col>

                    {/* Columna Central */}
                    <Col md={4} className="footer-col text-center central-col">
                    <p className="mouna-text mb-0">@Mouna Dietética CDG</p> <br />
                        <p className="copyright-text mb-0">
                            © {new Date().getFullYear()} Todos los derechos reservados
                        </p>
                    </Col>

                    {/* Columna Redes */}
                    <Col md={4} className="footer-col social-col">
                        <h5 className="footer-title mb-3">Seguinos</h5>
                        <div className="social-icons d-flex justify-content-center">
                            <a href="https://www.instagram.com/mounacdg/" className="social-link mx-2">
                                <FaInstagram size={26} />
                            </a>
                            <a href="/" className="social-link mx-2">
                                <FaFacebook size={26} />
                            </a>
                            <a href="/" className="social-link mx-2">
                                <FaWhatsapp size={26} />
                            </a>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;