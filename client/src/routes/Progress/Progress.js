import React, { useState } from 'react';
import styles from './Progress.module.css';
import {Button, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Progress, Row, UncontrolledAlert} from 'reactstrap';
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
    while (filteredMappings.length) {
      partitions.push(filteredMappings.splice(0, PARTITION_SIZE))
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
              <Input type="select" name="select" id="selectCore" defaultValue={selectedCoreId} onChange={e => selectCore(e.target.value)}>{coreRequirements.map((coreId) => <option>{coreId}</option>)}</Input>
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

class ProgressContainer extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {isAssignmentOpen: false, currentCoreId: 'A'}
    this.toggleAssignment = this.toggleAssignment.bind(this);
    this.selectCore = this.selectCore.bind(this);
  }

  selectCore(coreId) {
    this.setState({...this.state, currentCoreId: coreId})
  }

  toggleAssignment() {
    this.setState({...this.state, isAssignmentOpen: !this.state.isAssignmentOpen})
  }

  componentDidMount() {
    this.props.authenticated ? this.props.fetchAssignments() : this.props.logout(); // Log out the user if their token expired
  }

  render() {
    return (<div className={styles.Progress}>
      <div className={styles.ProgressHeader}>
        <div className={styles.ProgressBarContainer}>
          <div className='text-center'>{`${Math.floor(100*this.props.totalCredits/128)}%`}</div>
          <Progress color="success" value={Math.floor(100*this.props.totalCredits/128)} />
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
      {this.props.message && this.props.message.length > 0 && <UncontrolledAlert className={styles.message_notif} color="warning" fade={false}>{this.props.message}</UncontrolledAlert>}
    </div>)
  }
}

const mapStateToProps = (state) => {
  const { authenticated, user } = state.authReducer;
  const { coreAssignments, planMappings, message } = state.progressReducer
  return {
    planMappings: planMappings,
    message: message,
    coreAssignments: coreAssignments,
    user: user,
    authenticated: authenticated,
    totalCredits: 0,
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
