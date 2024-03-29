import React, { useState } from 'react';
import styles from './Header.module.css';
import { Row, Col, Container, Nav, Navbar, NavbarToggler, NavbarBrand, NavLink, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input, Label, FormText, NavItem, Alert, UncontrolledTooltip, Tooltip } from "reactstrap";
import logo from "../../images/UCLogo.png";
import { loginAction, registerAction, logoutAction } from '../../redux/actions/auth';
import { connect } from 'react-redux';
import majors from "../../shared/majors.json";
import gradDates from "../../shared/gradDates.json";

const Header = ({ isAuthenticated, user, message, valid, dispatch }) => { // isAuthenticated is a prop that we mapped from the redux store
  // Storing form data in state
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [gradDate, setGradDate] = useState(gradDates[gradDates.length-1]);
  const [startDate, setStartDate] = useState(gradDates[0]);
  const [major, setMajor] = useState(majors[0]);
  const [headshot, setHeadshot] = useState();

  // Using state to handle the login form's visibility
  const [displayModal, setDisplayModal] = useState(false);
  const toggleModal = () => setDisplayModal(!displayModal)

  // Toggler for registration page vs. login page
  const [isViewingRegister, setIsViewingRegister] = useState(false);
  const toggleRegister = () => setIsViewingRegister(!isViewingRegister);

  // Toggler for navbar links
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Validate that the registration matches the patterns so that we do not make unnecessary HTTP requests
  const validateRegistration = () => {
    const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
    const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null;
    const fNameValid = fName.match(/[A-Za-z]/) !== null;
    const lNameValid = lName.match(/[A-Za-z]/) !== null;
    const gradDateValid = gradDate !== null && gradDates.includes(gradDate);
    const startDateValid = startDate !== null && gradDates.includes(startDate);
    const majorValid = major !== null && majors.includes(major);
    const headshotValid = headshot !== null && /\.(png|jpe?g)$/i.test(headshot);
    const fieldsValidation = {
      'Email': emailValid,
      'Password': passwordValid,
      'First Name': fNameValid,
      'Last Name': lNameValid,
      'Grad Date': gradDateValid,
      'Start Date': startDateValid,
      'Major': majorValid,
      'Headshot': headshotValid
    }
    
    Object.entries(fieldsValidation).forEach((fieldInfo) => {
      if (!fieldInfo[1]) {
        alert(`${fieldInfo[0]} is in an invalid format!`)
      }
    })

    return emailValid && passwordValid && fNameValid && lNameValid && gradDateValid && majorValid && startDateValid && headshotValid;
  }

  // Calls the login function in the auth-action
  const attemptLogin = (e) => {
    e.preventDefault();
    dispatch(loginAction(email, password))
    .then((message) => !message && toggleModal())
    .catch((err) => console.error(err));
  };

  // Calls the register function in the auth-action
  const attemptRegister = (e) => {
    e.preventDefault();
    if (validateRegistration()) {
      dispatch(registerAction(email, password, fName, lName, startDate, gradDate, major, headshot))
      .then((message) => !message && toggleModal())
      .catch((err) => console.error(err));
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
          <Button color="primary" size="lg" className={styles.login_button} onClick={isAuthenticated ? attemptLogout :  toggleModal}>
            <span className ="fa fa-sign-in fa-lg"></span>{' '}
            {isAuthenticated ? "LOGOUT" : "LOGIN"}
          </Button>
          <Collapse isOpen={isNavOpen} navbar>
            {/* Navbar Links */}
            <Nav className="me-auto" navbar>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.home_nav_link} href="/home"><span id="homeIcon" title='Home Page' className = "fa fa-home fa-lg"></span><h4 className={styles.link_title}>Home</h4>
                </NavLink>
              </NavItem>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.progress_nav_link} href="/progress"><span id="progressIcon" title='My Progress' className = "fa fa-graduation-cap fa-lg"></span><h4 className={styles.link_title}>My Progress</h4>
                </NavLink>
              </NavItem>
              <NavItem className={styles.link_item}>
                <NavLink className={styles.planner_nav_link}  href="/planner"><span id="plannerIcon" title='Degree Builder' className = "fa fa-calendar fa-lg"></span><h4 className={styles.link_title}>Degree Builder</h4>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
          
        </Container>
      </Navbar>
      {/* Login Form Modal: conditionally display using the display boolean above */}
      <Modal isOpen={displayModal} toggle={toggleModal} fade={false}>
        {/* Login Modal Header */}
        <ModalHeader className={styles.portal_header}>
            <h4 className={styles.portal_title}>STUDENT PORTAL</h4>
            {message && <Alert className={styles.message_notif} fade={false} color={valid ? "success" : "danger"}>{message}</Alert>}
        </ModalHeader>
        {/* Login Modal Body: this is where the login form will go */}
        <ModalBody>
          {/* Conditionally render either registration form or login form? */}
          {!isViewingRegister ?
            // Login Form:
            <Form className="form" onSubmit={attemptLogin} >
              <FormGroup floating>
                <Input type="email" name="email" id="loginEmail" placeholder="example@example.com" onChange={e => setEmail(e.target.value)} required/>
                <Label for="loginEmail">Email</Label>
              </FormGroup>
              <FormGroup floating>
                <Input type="password" name="password" id="loginPassword" placeholder="********" onChange={e => setPassword(e.target.value)} required/>
                <Label for="loginPassword">Password</Label>
              </FormGroup>
              <Button color="primary" type="submit">LOGIN</Button>
            </Form> : 
            // Register Form:
            <Form className="form" onSubmit={attemptRegister} >
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="firstname" id="registerFName" onKeyPress={(e) => e.key==='Enter' && e.preventDefault()} placeholder="Jane" onChange={e => setFName(e.target.value)} required/>
                    <Label for="registerFName">First Name:</Label>
                  </FormGroup>  
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="text" name="lastname" id="registerLName" onKeyPress={(e) => e.key==='Enter' && e.preventDefault()} placeholder="Doe" onChange={e => setLName(e.target.value)} required/>
                    <Label for="registerLName">Last Name:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="email" name="email" id="registerEmail" onKeyPress={(e) => e.key==='Enter' && e.preventDefault()} placeholder="example@example.com" onChange={e => setEmail(e.target.value)} required />
                    <Label for="registerEmail">Input your email:</Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup floating>
                    <Input type="password" name="password" id="registerPassword" placeholder="********" onKeyPress={(e) => e.key==='Enter' && e.preventDefault()} onChange={e => setPassword(e.target.value)} required/>
                    <Label for="registerPassword">Create a password:</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <FormGroup>
                    <Label for="registerMajorSelect">Select your major:</Label>
                    <Input id="registerMajorSelect" name="select" type="select" onChange={e => setMajor(e.target.value)} required>
                      {majors.map((major) => <option>{major}</option>)}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="startDateSelect">Select your starting semester:</Label>
                    <Input id="startDateSelect" name="select" type="select" onChange={e => setStartDate(e.target.value)} required>
                      {gradDates.filter((date, i) => i <= gradDates.indexOf(gradDate)).map((date) => <option>{date}</option>)}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={5}>
                  <FormGroup>
                    <Label for="anticipatedGraduationSelect">Select your anticipated graduation year:</Label>
                    <Input id="anticipatedGraduationSelect" defaultValue={gradDates[gradDates.length-1]} name="select" type="select" onChange={e => setGradDate(e.target.value)} required>
                      {gradDates.map((date) => <option>{date}</option>)}
                    </Input>
                  </FormGroup>
                </Col>
                
              </Row>
              <FormGroup>
                <Label for="headshotUpload">Upload your Avatar:</Label>
                <Input id="headshotUpload" name="file" type="file" onChange={e => setHeadshot(e.target.value)} required/>
                <FormText>Please upload your headshot.</FormText>
              </FormGroup>
              <Button color="primary" type="submit">REGISTER</Button>
            </Form>
          }
        </ModalBody>
        {/* Login Modal Footer: this is where the submit and registration buttons will go */}
        <ModalFooter>
          {/* Login Modal Login Button */}
          <Button onClick={() => {toggleRegister()}}>
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
  const { authenticated, user, message, valid } = state.authReducer;
  return {
    isAuthenticated: authenticated,
    user: user,
    message: message,
    valid: valid
  }
}

export default connect(mapStateToProps)(Header);
