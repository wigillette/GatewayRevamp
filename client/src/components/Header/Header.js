import React from 'react';
import styles from './Header.module.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "../../images/UCLogo.png";


const Header = () => (
  <Navbar className={styles.header} bg="danger" expand="lg" sticky="top">
    <Container>
      <Navbar.Brand href="/home">
        <img alt="" src={logo} width="35" height="40" className="d-inline-block align-top"
        />{' '}
        <h4 className={styles.header_title}>STUDENT ACCESS PORTAL</h4>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse>
        <Nav className="me-auto">
          <Nav.Link className={styles.nav_link} href="/home"><span className = "fa fa-home fa-lg"></span><h4 className={styles.link_title}>Home</h4></Nav.Link>
          <Nav.Link className={styles.nav_link} href="/progress"><span className = "fa fa-graduation-cap fa-lg"></span><h4 className={styles.link_title}>My Progress</h4></Nav.Link>
          <Nav.Link className={styles.nav_link} href="/planning"><span className = "fa fa-calendar fa-lg"></span><h4 className={styles.link_title}>Degree Builder</h4></Nav.Link>
        </Nav>
        <Button variant="primary" size="lg" className="d-flex">
          <span className ="fa fa-sign-in fa-lg"></span>
        </Button>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  
);

Header.propTypes = {};

Header.defaultProps = {};

export default Header;
