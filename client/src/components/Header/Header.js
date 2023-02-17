import React, { useState } from 'react';
import styles from './Header.module.css';
import { Row, Col, Container, Nav, Navbar, NavbarBrand, NavLink, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input, Label, FormText } from "reactstrap";
import logo from "../../images/UCLogo.png";
import { useAuth0 } from '@auth0/auth0-react';

const Header = () => {
  // Using state to handle the login form's visibility
  const [displayModal, setDisplayModal] = useState(false);
  const toggleModal = () => setDisplayModal(!displayModal);

  // Toggler for registration page vs. login page
  const [onRegister, setOnRegister] = useState(false);
  const toggleRegister = () => setOnRegister(!onRegister);

  // Request to the server to login the user and receive a response (may need to add Redux store update here)
  const { loginWithRedirect } = useAuth0();
  const { logout } = useAuth0();
  const { isAuthenticated } = useAuth0();

  const attemptLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/progress",
      },
    });
  };

  // Request to the server to register the new user and receive a response (may need to add Redux store update here)
  const attemptRegister = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/progress",
      },
      authorizationParams: {
        screen_hint: "signup",
      },
    });
  };

  // Handle user log out
  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

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
            {/* Sign in Form Button/Sign out Button: use state to toggle it and conditionally change the onClick function */}
            <Button variant="primary" size="lg" className="d-flex" onClick={isAuthenticated ? handleLogout : toggleModal}>
              <span className ="fa fa-sign-in fa-lg"></span>
            </Button>
          </Collapse>
        </Container>
      </Navbar>
      {/* Login Form Modal: conditionally display using the display boolean above */}
      <Modal isOpen={displayModal} toggle={toggleModal} backdrop="static" fade={false}>
        {/* Login Modal Header */}
        <ModalHeader toggle={toggleModal}>
            <h4 className={styles.portal_title}>STUDENT PORTAL</h4>
        </ModalHeader>
        {/* Login Modal Body: this is where the login form will go */}
        <ModalBody>
          {/* Conditionally render either registration form or login form? */}
          {!onRegister ?
            // Login Form:
            <Form className="form" onSubmit={attemptLogin} >
              <FormGroup floating>
                <Input type="email" name="email" id="loginEmail" placeholder="example@example.com" required/>
                <Label for="loginEmail">Username</Label>
              </FormGroup>
              <FormGroup floating>
                <Input type="password" name="password" id="loginPassword" placeholder="********" required/>
                <Label for="loginPassword">Password</Label>
              </FormGroup>
              <Button type="submit">LOGIN</Button>
            </Form> : 
            // Register Form:
            <Form className="form" onSubmit={attemptRegister} >
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="firstname" id="registerFName" placeholder="Jane" required/>
                    <Label for="registerFName">First Name:</Label>
                  </FormGroup>  
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="lastname" id="registerLName" placeholder="Doe" required/>
                    <Label for="registerLName">Last Name:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="email" name="email" id="registerEmail" placeholder="example@example.com" required />
                    <Label for="registerEmail">Input your email:</Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="password" name="password" id="registerPassword" placeholder="********" required/>
                    <Label for="registerPassword">Create a password:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="registerMajorSelect">Select your major:</Label>
                    <Input id="registerMajorSelect" name="select" type="select" required>
                      <option>Computer Science</option>
                      <option>Mathematics</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="anticipatedGraduationSelect">Select your anticipated graduation year:</Label>
                    <Input id="anticipatedGraduationSelect" name="select" type="select" required>
                      <option>Spring 2023</option>
                      <option>Fall 2023</option>
                      <option>Spring 2024</option>
                      <option>Fall 2024</option>
                      <option>Spring 2025</option>
                      <option>Fall 2025</option>
                      <option>Spring 2026</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="headshotUpload">Upload your Avatar:</Label>
                <Input id="headshotUpload" name="file" type="file" required/>
                <FormText>Please upload your headshot.</FormText>
              </FormGroup>
              
              <Button type="submit">REGISTER</Button>
            </Form>
          }
        </ModalBody>
        {/* Login Modal Footer: this is where the submit and registration buttons will go */}
        <ModalFooter>
          {/* Login Modal Login Button */}
          <Button variant="danger" onClick={() => {toggleRegister()}}>
            {onRegister ? "VIEW LOGIN" : "VIEW REGISTER"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
Header.propTypes = {};

Header.defaultProps = {};

export default Header;
