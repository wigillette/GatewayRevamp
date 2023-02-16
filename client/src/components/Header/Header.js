import React, { useState } from 'react';
import styles from './Header.module.css';
import { Container, Nav, Navbar, NavbarBrand, NavLink, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, FormFeedback, Input, Label } from "reactstrap";
import logo from "../../images/UCLogo.png";

const Header = () => {
  // Using state to handle the login form's visibility
  const [display, setDisplay] = useState(false);
  const toggle = () => setDisplay(!display);

  // Toggler for registration page vs. login page
  const [onRegister, setOnRegister] = useState(false);
  const toggleRegister = () => setOnRegister(!onRegister);

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
        <ModalBody>
          {/* Conditionally render either registration form or login form? */}
          <Form className="form">
            {!onRegister ?
              // Again using a fragment to conditonally render multiple elements at once
              // Login Form:
              <>
                <FormGroup>
                  <Label for="loginEmail">Username</Label>
                  <Input type="email" name="email" id="loginEmail" placeholder="example@example.com"/>
                </FormGroup>
                <FormGroup>
                  <Label for="loginPassword">Password</Label>
                  <Input type="password" name="password" id="loginPassword" placeholder="********"/>
                </FormGroup>
                <Button>LOGIN</Button>
              </> : 
              // Register Form:
              <>
                <FormGroup>
                  <Label for="registerEmail">Input your email:</Label>
                  <Input type="email" name="email" id="registerEmail" placeholder="example@example.com"/>
                </FormGroup>
                <FormGroup>
                  <Label for="registerPassword">Create a password:</Label>
                  <Input type="password" name="password" id="registerPassword" placeholder="********"/>
                </FormGroup>
                <FormGroup>
                  <Label for="registerMajorSelect">Select your major:</Label>
                  <Input id="registerMajorSelect" name="select" type="select">
                    <option>Computer Science</option>
                    <option>Mathematics</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="anticipatedGraduationSelect">Select your anticipated graduation year:</Label>
                  <Input id="anticipatedGraduationSelect" name="select" type="select">
                    <option>2023</option>
                    <option>2024</option>
                    <option>2025</option>
                    <option>2026</option>
                  </Input>
                </FormGroup>
                <Button>REGISTER</Button>
              </>  
            }
          </Form>
         
        </ModalBody>
        {/* Login Modal Footer: this is where the submit and registration buttons will go */}
        <ModalFooter>
          {/* Login Modal Login Button */}
          <Button variant="danger" onClick={() => {toggleRegister()}}>
            {onRegister ? "LOGIN" : "REGISTER"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
Header.propTypes = {};

Header.defaultProps = {};

export default Header;
