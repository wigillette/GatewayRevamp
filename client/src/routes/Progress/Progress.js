import React, { useState } from 'react';
import styles from './Progress.module.css';
import {Button, ButtonGroup, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Row, UncontrolledAlert, ButtonToolbar, Media} from 'reactstrap';
import { connect } from 'react-redux';
import { assignCoreAction, fetchAssignmentsAction } from '../../redux/actions/progress';
import { logoutAction } from '../../redux/actions/auth';

const CourseInfo = ({id, setCourseId, selectedId}) => {
  return <Card>
    <CardHeader><p className={styles.course_info_title}>{id}</p></CardHeader>
    <CardBody>
      <Button onClick={(e) => {
          e.preventDefault(); 
          const newCourseId = id === selectedId ? null : id; 
          setCourseId(newCourseId);
        }} color={id === selectedId ? "success" : "secondary"} className={styles.course_select}><i className ="fa fa-plus-circle fa-lg"></i>{'  '}SELECT</Button>
    </CardBody>
  </Card>
}


const CoreAssignmentForm = ({isAssignmentOpen, toggleFunction, selectedCoreId, selectCore, coreRequirements, planMappings, assignCoreFunction}) => {
  const [selectedCourseId, setCourseId] = useState(null);
  const DEFAULT_CORE = 'A';
  const PARTITION_SIZE = 3;
  
  const assignCoreEvent = (e) => {
    e.preventDefault();
    if (selectedCourseId && selectedCoreId) {
      assignCoreFunction(selectedCourseId, selectedCoreId);
      selectCore(DEFAULT_CORE);
      toggleFunction();
    } else {
      alert("Must select a course!");
    }
  }

  const reshapeMappings = (filteredMappings) => {
    const partitions = [];
    const mappingsCopy = JSON.parse(JSON.stringify(filteredMappings))
    while (mappingsCopy.length) {
      partitions.push(mappingsCopy.splice(0, PARTITION_SIZE))
    }
    return partitions;
  }

  return (<Modal isOpen={isAssignmentOpen} fade={false}>
    <Form onSubmit={(e) => assignCoreEvent(e)}>
      <ModalHeader toggle={toggleFunction} className={styles.browser_header}>Core Requirement Assignment</ModalHeader>
        <ModalBody>
            {/* Core Requirements Dropdown */}
            <FormGroup>
              <Label for="selectCore">Select Core Requirement:</Label>
              <Input type="select" name="select" id="selectCore" defaultValue={selectedCoreId} onChange={e => {selectCore(e.target.value); setCourseId(null);}}>{coreRequirements.map((coreId) => <option>{coreId}</option>)}</Input>
            </FormGroup>
            <br/>
            {/* Course Container */}
            <div className={styles.course_container}>
              <p className={styles.course_container_title}>Course List</p>
              <Container fluid>
                {reshapeMappings(planMappings.filter((mapping) => mapping.coreId === selectedCoreId))
                .map((courseRow) => <Row>{courseRow.map((course) => <Col md={12/PARTITION_SIZE}><CourseInfo id={course.courseId} setCourseId={setCourseId} selectedId={selectedCourseId}/></Col>)}</Row>)}
              </Container>
            </div>
        </ModalBody>
      <ModalFooter><Button color="primary" className={styles.assign_course} type="submit"><i className ="fa fa-link fa-lg"></i>{'  '}ASSIGN CORE</Button></ModalFooter>
    </Form>
  </Modal>)
}

const PopUpForm = ({isPopUpOpen, togglePopUp, coreId, courseId}) => { 
  return <Modal isOpen={isPopUpOpen} fade={false}>
    <ModalHeader toggle={togglePopUp} className={styles.browser_header}>{coreId} Assignment</ModalHeader>
    <ModalBody><p className={styles.course_container_title}>{courseId}</p></ModalBody>
  </Modal>
}

class ProgressContainer extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {isAssignmentOpen: false, currentCoreId: 'A', popUpCourseId: '', isPopUpOpen: false}
    this.toggleAssignment = this.toggleAssignment.bind(this);
    this.togglePopUp = this.togglePopUp.bind(this);
    this.selectCore = this.selectCore.bind(this);
    this.partitionRequirements = this.partitionRequirements.bind(this)
    this.PARTITION_SIZE = 4
  }

  selectCore(coreId) {
    return new Promise((resolve, reject) => {this.setState({...this.state, currentCoreId: coreId}); resolve(coreId);})
  }

  toggleAssignment() {
    this.setState({...this.state, isAssignmentOpen: !this.state.isAssignmentOpen})
  }

  togglePopUp() {
    this.setState({...this.state, isPopUpOpen: !this.state.isPopUpOpen})
  }

  setPopUpCourseId(courseId) {
    return new Promise((resolve, reject) => {this.setState({...this.state, popUpCourseId: courseId}); resolve(courseId);});
  }

  componentDidMount() {
    this.props.authenticated ? this.props.fetchAssignments() : this.props.logout(); // Log out the user if their token expired
  }

  partitionRequirements() {
    const coreIds = Object.entries(this.props.coreAssignments);
    let partitions = []
    while (coreIds.length) {
      partitions.push(coreIds.splice(0, this.PARTITION_SIZE))
    }

    return partitions
  }

  render() {
    return (<div className={styles.Progress}>
      <div className={styles.ProgressHeader}>
        <h3 className={styles.header_title}>My Progress</h3>
        <div className={styles.ProgressBarContainer}>
          <div className='text-center'>{`${Math.floor(100*this.props.totalCredits/128)}%`}</div>
          <Progress animated color="success" value={Math.floor(100*this.props.totalCredits/128)}>{`${this.props.totalCredits}/128`}</Progress>
        </div>
        <Button className={styles.assignent_toggle} color='primary' size="lg" onClick={this.toggleAssignment}><span className ="fa fa-plus-circle fa-lg"></span>{' '}ASSIGN REQUIREMENT</Button>
        <hr className={styles.header_divider}></hr>
      </div>
      <CoreAssignmentForm 
          isAssignmentOpen={this.state.isAssignmentOpen} 
          toggleFunction={this.toggleAssignment} 
          selectedCoreId={this.state.currentCoreId} 
          selectCore={this.selectCore} 
          coreRequirements={Object.keys(this.props.coreAssignments)} 
          planMappings={this.props.planMappings} 
          assignCoreFunction={this.props.assignCore} 
      />
      <PopUpForm
        isPopUpOpen={this.state.isPopUpOpen}
        togglePopUp={this.togglePopUp}
        coreId={this.state.currentCoreId}
        courseId={this.state.popUpCourseId}
      />
      {this.props.message && this.props.message.length > 0 && <UncontrolledAlert className={styles.message_notif} color="warning" fade={false}>{this.props.message}</UncontrolledAlert>}
      {this.props.user && this.props.user.fName && this.props.user.major && this.props.user.lName && this.props.user.headshot && this.props.user.email && <div className={styles.information_container}>
        <Media>
          <Media left top href="#"><Media object data-src={this.props.user.headshot} alt='Headshot' /></Media>
          <Media body>
            <Media heading><p className={styles.information_header}>STUDENT INFORMATION:</p></Media>
            <p className={styles.information_full_name}><b>{this.props.user.fName + " " + this.props.user.lName}</b>, {this.props.user.email}</p>
            <p className={styles.information_major}><b>Major:</b> {this.props.user.major}</p>
          </Media>
        </Media>
      </div>}
      <div className={styles.assignment_container}>
        <h3 className={styles.assignment_header}>CORE REQUIREMENTS:</h3>
        <ButtonGroup className='btn-primary-group' size='lg'>
          {this.partitionRequirements().map((assignmentGroup) => (
            <ButtonToolbar>
              <ButtonGroup size='lg' vertical>
                {assignmentGroup.map((assignmentEntry) => <Button onClick={() => {
                    this.selectCore(assignmentEntry[0]).then(() => {
                      if (assignmentEntry[1]) {
                        this.setPopUpCourseId(assignmentEntry[1]).then(this.togglePopUp);
                      } else {
                        this.toggleAssignment();
                      }
                    })
                  }
                } className={styles.core_button} color={assignmentEntry[1] ? "success" : "danger"}>{assignmentEntry[0]}</Button>)}
              </ButtonGroup>
            </ButtonToolbar>)
          )}
        </ButtonGroup>
      </div>
    </div>)
  }
}

const mapStateToProps = (state) => {
  const { authenticated, user } = state.authReducer;
  const { coreAssignments, planMappings, totalCredits, message } = state.progressReducer
  return {
    planMappings: planMappings,
    message: message,
    coreAssignments: coreAssignments,
    user: user,
    authenticated: authenticated,
    totalCredits: totalCredits,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAssignments: () => dispatch(fetchAssignmentsAction()),
    assignCore: (courseId, coreId) => dispatch(assignCoreAction(courseId, coreId)),
    logout: () => dispatch(logoutAction())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressContainer);
