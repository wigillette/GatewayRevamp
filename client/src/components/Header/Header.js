import React, { useState } from 'react';
import styles from './Header.module.css';
import { Container, Nav, Navbar, NavbarBrand, NavLink, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import logo from "../../images/UCLogo.png";

const Header = () => {
  // Using state to handle the login form's visibility
  const [display, setDisplay] = useState(false);
  const toggle = () => setDisplay(!display);
  
  return (
    <>  {/* Using a fragment here to return both the navbar and the login modal */}
      {/*Navbar Component*/}
      <Navbar className={styles.header} bg="danger" expand="lg" fixed='top' light>
        <Container>
          <NavbarBrand href="/home">
            <img alt="" src={logo} width="35" height="40" className="d-inline-block align-top"
            />{' '}
            <h4 className={styles.header_title}>STUDENT ACCESS PORTAL</h4>
          </NavbarBrand>
          {/* <NavbarToggle aria-controls="basic-navbar-nav" /> */}
          <Collapse navbar>
            {/* Navbar Links */}
            <Nav className="me-auto" navbar>
              <NavLink className={styles.nav_link} href="/home"><span className = "fa fa-home fa-lg"></span><h4 className={styles.link_title}>Home</h4></NavLink>
              <NavLink className={styles.nav_link} href="/progress"><span className = "fa fa-graduation-cap fa-lg"></span><h4 className={styles.link_title}>My Progress</h4></NavLink>
              <NavLink className={styles.nav_link} href="/planning"><span className = "fa fa-calendar fa-lg"></span><h4 className={styles.link_title}>Degree Builder</h4></NavLink>
            </Nav>
            {/* Login Form Button: use state to toggle it */}
            <Button variant="primary" size="lg" className="d-flex" onClick={toggle}>
              <span className ="fa fa-sign-in fa-lg"></span>
            </Button>
          </Collapse>
        </Container>
      </Navbar>
      {/* Login Form Modal: conditionally display using the display boolean above */}
      <Modal isOpen={display} toggle={toggle} backdrop="static" fade={false}>
        {/* Login Modal Header */}
        <ModalHeader toggle={toggle}>
            <h4 className={styles.portal_title}>STUDENT PORTAL</h4>
        </ModalHeader>
        {/* Login Modal Body: this is where the login form will go */}
        <ModalBody>Form stuff goes here</ModalBody>
        {/* Login Modal Footer: this is where the submit and registration buttons will go */}
        <ModalFooter>
          {/* Login Modal Login Button */}
          <Button variant="primary" onClick={() => {alert("Submitting data to database"); toggle()}}>
            LOGIN
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
Header.propTypes = {};

Header.defaultProps = {};

export default Header;
