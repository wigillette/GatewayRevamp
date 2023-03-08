import React, { useEffect, useState } from 'react';
import styles from './Semester.module.css';
import { Card, CardHeader, ListGroup, ListGroupItem, Button, CardFooter, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledAlert, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, InputGroup, Row, Col, Container } from 'reactstrap';
import { connect } from 'react-redux';
import { removeCourseAction, addCoursesAction, fetchPlanAction } from '../../redux/actions/planner';
/* Idea is to structure courses within plannedCourses as courseInfo dictionaries:
   semesterPlan: [{
              id: string
              title: string,
              description: string,
              cores: string[],
              creditAmount: number,
              offered: ["Fall", "Spring", "Odd", "Even"]
              }, ...]
*/

/* CourseInfo Component
   Displays information about a respective course*/
const CourseInfo = ({courseInfo, semesterKey, removeCourse}) => {
  const attemptCourseRemoval = (courseId) => {
    removeCourse(courseId, semesterKey)
    .catch((err) => alert(err));
  }

  return (<Card className={styles.course_info}>
    <CardHeader>
      <p className={styles.course_title}>{courseInfo?.title || "No Title"}</p> 
      <Button className={styles.remove_course} size='lg' color='danger' onClick={() => courseInfo?.id !== null ? attemptCourseRemoval(courseInfo.id) : alert("Invalid Course")}>
        <span className ="fa fa-minus-circle fa-lg"></span>{'  '}REMOVE
      </Button>
    </CardHeader>
    
    <ListGroup flush>
      <ListGroupItem>
        <p className={styles.course_label}>{courseInfo?.description || "No Description"}</p>
      </ListGroupItem>
      <ListGroupItem>
        <p className={styles.course_label}><b>Core Requirements: </b>{courseInfo?.cores?.length > 0 ? courseInfo.cores.join(', ') : "None" }</p>
      </ListGroupItem>
    </ListGroup>
    <CardFooter><p className={styles.course_credits}>Credit Total: {courseInfo.creditAmount}</p></CardFooter>
  </Card>)
}

/* SemesterDropDown Component
   Allows users to select a semester to view*/
const SemesterDropdown = ({keyList, activeIndex, setSemesterKey}) => (
  <UncontrolledButtonDropdown className={styles.semester_dropdown} direction='down'>
    <DropdownToggle caret color='primary' className={styles.dropdown_toggle} size='lg'><span className ="fa fa-eye fa-lg"></span>{'  '}SWITCH</DropdownToggle>
    <DropdownMenu>
      {keyList.map((semesterKey, index) => (<DropdownItem onClick={() => setSemesterKey(index)} active={semesterKey === keyList[activeIndex]}>
        <p className={styles.semester_label}>{semesterKey}</p>
      </DropdownItem>))}
    </DropdownMenu>
  </UncontrolledButtonDropdown>
)

// Add Courses CourseInfo Component
const BrowserCourse = ({courseInfo, selectedCourses, setSelectedCourses}) => { 
  const updateSelection = (isSelected) => {
    if (isSelected) {
      setSelectedCourses([...selectedCourses, courseInfo.id])
    } else if (selectedCourses.includes(courseInfo.id)) {
      setSelectedCourses((prevSelected) => prevSelected.filter((id) => id !== courseInfo.id))
    }
  }

  return (
  <Card className={styles.browser_course}>
    <CardHeader>
      <p className={styles.browser_course_title}>{courseInfo?.title || "No Title"}</p>
      <FormGroup check className={styles.course_select_toggle}>
        <Label check><Input type="checkbox" onChange={(e) => updateSelection(e.target.checked)}></Input>{' '}Select</Label>
      </FormGroup>
    </CardHeader>
    <ListGroup flush>
      <ListGroupItem>
        <p>{courseInfo?.description || "No Description"}</p>
      </ListGroupItem>
      <ListGroupItem>
        <p><b>Core Requirements: </b>{courseInfo?.cores?.length > 0 ? courseInfo.cores.join(', ') : "None" }</p>
      </ListGroupItem>
    </ListGroup>
    <CardFooter><p><b>Credit Total: {courseInfo.creditAmount}</b></p></CardFooter>
  </Card>) 
};

// Add Courses Form
const BrowserModal = ({addCourses, semesterViewingId, isBrowserActive, toggleFunction, semesterKeys, courseCatalog }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Will eventually replace the below filters with filters fetched from and defined by the server
  const [appliedFilters, setAppliedFilters] = useState({Fall: false, Spring: false, Even: false, Odd: false});
  // SemesterViewingId is the semester the user is currently viewing outside of the modal
  const [semester, selectSemester] = useState(semesterViewingId);
  // Updates the displayedCourses by applying the selected filters and search queries
  const renderFilteredCourses = () => {
    // also use state to make a setQuery query variable
    const appliedKeys = Object.keys(appliedFilters).filter((key) => appliedFilters[key]);
    let filteredCatalog = courseCatalog.filter((courseInfo) => appliedKeys.every((filterKey) => courseInfo.offered.includes(filterKey)));
    if (searchQuery.length > 0) {
      filteredCatalog = filteredCatalog.filter((courseInfo) => searchQuery === courseInfo.title.substring(0,searchQuery.length))
    }
    setDisplayedCourses(filteredCatalog);
  }

  // Update the displayed courses each time a changed is made to the appliedFilters
  useEffect(renderFilteredCourses, [appliedFilters, courseCatalog])

  const addCoursesAction = () => {
    addCourses(selectedCourses, semester)
    toggleFunction();
  }

  return (
    <Modal isOpen={isBrowserActive} toggle={toggleFunction} fade={false}>
      <ModalHeader toggle={toggleFunction} className={styles.browser_header}>Course Browser</ModalHeader>
      <ModalBody>
        <Form onSubmit={addCoursesAction}>
          {/* Semester Dropdown */}
          <FormGroup>
            <Label for="selectSemester">Select Semester:</Label>
            <Input type="select" name="select" id="selectSemester" onChange={e => selectSemester(e.target.value)}>{semesterKeys.map((semesterId) => <option>{semesterId}</option>)}</Input>
          </FormGroup>
          {/* Filters */}
          <FormGroup check >
            <Row>
              {Object.keys(appliedFilters).map((filterKey) => (
                <Col md={3}>
                  <Label check>
                    <Input type="checkbox" onChange={(e) => setAppliedFilters({...appliedFilters, [filterKey]: e.target.checked})}></Input>{' '}{filterKey}
                  </Label>
                </Col>
              ))}
            </Row>
          </FormGroup>
          <br/>
          {/* Course Search Bar */}
          <FormGroup>
            <InputGroup>
              <Button className={styles.course_search_button} onClick={renderFilteredCourses}><span className='fa fa-search fa-lg'></span></Button>
              <Input type="text" onChange={e => setSearchQuery(e.target.value)} placeholder="Search for a course directly!"></Input>
            </InputGroup>
          </FormGroup>
          {/* Course Container */}
          <div className={styles.course_container}>
            <p className={styles.course_container_title}>Course List</p>
            <Container fluid>
              <Row>{displayedCourses.map((courseInfo) => <Col md={4}><BrowserCourse courseInfo={courseInfo} selectedCourses={selectedCourses} setSelectedCourses={setSelectedCourses} /></Col>)}</Row>
            </Container>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter><Button color="primary" className={styles.add_courses} type="submit">ADD COURSES</Button></ModalFooter>
    </Modal>
  )
}

/*
  Semester Component:
  The content container for the planner page
*/
class Semester extends React.Component {
  constructor(props) {
    super(props);
    this.state = {semesterKey: 0, isBrowserActive: false}
    this.setSemesterKey = this.setSemesterKey.bind(this);
    this.toggleBrowser = this.toggleBrowser.bind(this);
  }

  setSemesterKey(key) { 
    this.setState({...this.state, semesterKey: key})
  };

  toggleBrowser() {
    this.setState({...this.state, isBrowserActive: !this.state.isBrowserActive})
  }

  componentDidMount() { // Using a class component here to fetch the initial plan upon mounting the semester component
    this.props.fetchPlan();
  }

  render() {
    return (this.props.fullPlan && Object.keys(this.props.fullPlan).length > 0) ? (
      <div className={styles.Semester}>
        <div className={styles.plan_header}>
          <h3 className={styles.semester_header}>{Object.keys(this.props.fullPlan)[this.state.semesterKey]} Course Plan</h3>
          <SemesterDropdown keyList={Object.keys(this.props.fullPlan)} activeIndex={this.state.semesterKey} setSemesterKey={this.setSemesterKey} />
          <Button color='primary' size="lg" onClick={this.toggleBrowser} className={styles.browser_toggle}><span className ="fa fa-search fa-lg"></span>{'  '}COURSE BROWSER</Button>
          <hr className={styles.semester_divider}></hr>
        </div>
        {this.props.message && this.props.message.length > 0 && <UncontrolledAlert className={styles.message_notif} color="warning" fade={false}>{this.props.message}</UncontrolledAlert>}
        <div className={styles.plan_container}>
          {this.props.fullPlan[Object.keys(this.props.fullPlan)[this.state.semesterKey]].map((courseInfo) => 
            <CourseInfo courseInfo={courseInfo} semesterKey={Object.keys(this.props.fullPlan)[this.state.semesterKey]} removeCourse={this.props.removeCourse}/>
          )}
        </div>
        <BrowserModal addCourses={this.props.addCourses} semesterViewingId={Object.keys(this.props.fullPlan)[this.state.semesterKey]} isBrowserActive={this.state.isBrowserActive} toggleFunction={this.toggleBrowser} semesterKeys={Object.keys(this.props.fullPlan)} courseCatalog={this.props.courseCatalog} />
      </div>) 
    : <p>Failed to initialize the full semester plan or display the specified semester's plan.</p>
  }
}

Semester.propTypes = {};
Semester.defaultProps = {};

const mapStateToProps = (state) => {
  const { fullPlan, message, courseCatalog } = state.planReducer;
  return {
    fullPlan: fullPlan,
    message: message,
    courseCatalog: courseCatalog
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPlan: () => dispatch(fetchPlanAction()),
    removeCourse: (courseId, semesterKey) => dispatch(removeCourseAction(courseId, semesterKey)),
    addCourses: (courseIdList, semesterKey) => dispatch(addCoursesAction(courseIdList, semesterKey))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Semester);
