import React, { useState } from 'react';
import styles from './Header.module.css';
import { Row, Col, Container, Nav, Navbar, NavbarToggler, NavbarBrand, NavLink, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input, Label, FormText, NavItem } from "reactstrap";
import logo from "../../images/UCLogo.png";
import { loginAction, registerAction, logoutAction } from '../../redux/actions/auth';
import { connect } from 'react-redux';

const Header = ({ isAuthenticated, user, dispatch }) => { // isAuthenticated is a prop that we mapped from the redux store
  // Storing form data in state
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [gradDate, setGradDate] = useState();
  const [major, setMajor] = useState();
  const [headshot, setHeadshot] = useState();

  // Using state to handle the login form's visibility
  const [displayModal, setDisplayModal] = useState(false);
  const toggleModal = () => setDisplayModal(!displayModal)

  // Toggler for registration page vs. login page
  const [isViewingRegister, setIsViewingRegister] = useState(false);
  const toggleRegister = () => setIsViewingRegister(!isViewingRegister);

  // Toggler for navbar links
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Validate that the login matches the patterns so that we do not make unnecessary HTTP requests
  const validateLogin = () => {
    const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
    const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null;
    return emailValid && passwordValid;
  }

  // Validate that the registration matches the patterns so that we do not make unnecessary HTTP requests
  const validateRegistration = () => {
    const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
    const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null;
    const fNameValid = fName.match(/[A-Za-z]/) !== null;
    const lNameValid = lName.match(/[A-Za-z]/) !== null;
    const gradDateValid = gradDate !== null;
    const majorValid = major !== null;
    return emailValid && passwordValid && fNameValid && lNameValid && gradDateValid && majorValid;
  }

  // Calls the login function in the auth-action
  const attemptLogin = (e) => {
    e.preventDefault();
    if (validateLogin()) {
      console.log("LOGIN VALIDATED")
      dispatch(loginAction(email, password))
      .then(toggleModal)
      .catch((err) => alert("Failed to register"));
    } else {
      console.log("INVALID");
    }
  };

  // Calls the register function in the auth-action
  const attemptRegister = (e) => {
    e.preventDefault();
    if (validateRegistration()) {
      dispatch(registerAction(email, password, fName, lName, gradDate, major, headshot))
      .then(toggleModal)
      .catch((err) => alert("Failed to register"));
    } else {
      alert("Some registration fields are invalid!")
    }
  };

  const attemptLogout = (e) => {
    e.preventDefault();
    dispatch(logoutAction())
  }


  return (
    <>  {/* Using a fragment here to return both the navbar and the login modal */}
      {/*Navbar Component*/}
      <Navbar className={styles.header} bg="danger" expand="lg" fixed='top' light>
        <Container>
          <NavbarBrand href="/home" className="brand">
            <img alt="" src={logo} width="35" height="40" className="d-inline-block align-top"
            />{' '}
            <h4 className={styles.header_title}>STUDENT ACCESS PORTAL</h4>
          </NavbarBrand>
          <NavbarToggler className={styles.menu_toggler} onClick={() => setIsNavOpen(!isNavOpen)} aria-controls="basic-navbar-nav" />
          <Button variant="primary" size="lg" className={styles.login_button} onClick={isAuthenticated ? attemptLogout :  toggleModal}>
            <span className ="fa fa-sign-in fa-lg"></span>{' '}
            {isAuthenticated ? "LOGOUT" : "LOGIN"}
          </Button>
          <Collapse isOpen={isNavOpen} navbar>
            {/* Navbar Links */}
            <Nav className="me-auto" navbar>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.nav_link} href="/home"><span className = "fa fa-home fa-lg"></span><h4 className={styles.link_title}>Home</h4></NavLink>
              </NavItem>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.nav_link} href="/progress"><span className = "fa fa-graduation-cap fa-lg"></span><h4 className={styles.link_title}>My Progress</h4></NavLink>
              </NavItem>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.nav_link} href="/planner"><span className = "fa fa-calendar fa-lg"></span><h4 className={styles.link_title}>Degree Builder</h4></NavLink>
              </NavItem>
            </Nav>
            {/* Sign in Form Button/Sign out Button: use state to toggle it and conditionally change the onClick function */}
          </Collapse>
          
        </Container>
      </Navbar>
      {/* Login Form Modal: conditionally display using the display boolean above */}
      <Modal isOpen={displayModal} toggle={toggleModal} backdrop="static" fade={false}>
        {/* Login Modal Header */}
        <ModalHeader>
            <h4 className={styles.portal_title}>STUDENT PORTAL</h4>
        </ModalHeader>
        {/* Login Modal Body: this is where the login form will go */}
        <ModalBody>
          {/* Conditionally render either registration form or login form? */}
          {!isViewingRegister ?
            // Login Form:
            <Form className="form" onSubmit={attemptLogin} >
              <FormGroup floating>
                <Input type="email" name="email" id="loginEmail" placeholder="example@example.com" onChange={e => setEmail(e.target.value)} required/>
                <Label for="loginEmail">Username</Label>
              </FormGroup>
              <FormGroup floating>
                <Input type="password" name="password" id="loginPassword" placeholder="********" onChange={e => setPassword(e.target.value)} required/>
                <Label for="loginPassword">Password</Label>
              </FormGroup>
              <Button type="submit">LOGIN</Button>
            </Form> : 
            // Register Form:
            <Form className="form" onSubmit={attemptRegister} >
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="firstname" id="registerFName" placeholder="Jane" onChange={e => setFName(e.target.value)} required/>
                    <Label for="registerFName">First Name:</Label>
                  </FormGroup>  
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="lastname" id="registerLName" placeholder="Doe" onChange={e => setLName(e.target.value)} required/>
                    <Label for="registerLName">Last Name:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="email" name="email" id="registerEmail" placeholder="example@example.com" onChange={e => setEmail(e.target.value)} required />
                    <Label for="registerEmail">Input your email:</Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="password" name="password" id="registerPassword" placeholder="********" onChange={e => setPassword(e.target.value)} required/>
                    <Label for="registerPassword">Create a password:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="registerMajorSelect">Select your major:</Label>
                    <Input id="registerMajorSelect" name="select" type="select" onChange={e => setMajor(e.target.value)} required>
                      <option>Computer Science</option>
                      <option>Mathematics</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="anticipatedGraduationSelect">Select your anticipated graduation year:</Label>
                    <Input id="anticipatedGraduationSelect" name="select" type="select" onChange={e => setGradDate(e.target.value)} required>
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
                <Input id="headshotUpload" name="file" type="file" onChange={e => setHeadshot(e.target.value)} required/>
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
            {isViewingRegister ? "VIEW LOGIN" : "VIEW REGISTER"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

Header.propTypes = {};
Header.defaultProps = {};

// Map the props in our component to the store's state so that the component
// updates every time there is a change in the respective part of the store's state
const mapStateToProps = (state) => {
  const { authenticated, user } = state.authReducer;
  return {
    isAuthenticated: authenticated,
    user: user
  }
}

export default connect(mapStateToProps)(Header);
