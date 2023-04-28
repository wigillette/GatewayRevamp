import React, { useEffect, useState } from 'react';
import styles from './Semester.module.css';
import { Card, CardHeader, ListGroup, ListGroupItem, Button, CardFooter, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledAlert, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, InputGroup, Row, Col, Container, Spinner } from 'reactstrap';
import { connect } from 'react-redux';
import { removeCourseAction, addCoursesAction, fetchPlanAction } from '../../redux/actions/planner';
import cores from "../../shared/cores.json";
import { logoutAction } from '../../redux/actions/auth';

/* CourseInfo Component
   Displays information about a respective course*/
const CourseInfo = ({courseInfo, semesterKey, removeCourse}) => {
  const attemptCourseRemoval = (courseId) => {
    removeCourse(courseId, semesterKey)
    .catch((err) => alert("Failed to remove course. | Unexpected error"));
  }

  return (<Card className={styles.course_info}>
    <CardHeader>
      <p className={styles.main_course_id}>{courseInfo?.id || "No Title"}</p> 
      <Button className={styles.remove_course} size='lg' color='danger' onClick={() => courseInfo?.id !== null ? attemptCourseRemoval(courseInfo.id) : alert("Invalid Course")}>
        <span className ="fa fa-minus-circle fa-lg"></span>{'  '}REMOVE
      </Button>
    </CardHeader>
    
    <ListGroup flush>
      <ListGroupItem>
        <h3 className={styles.main_course_title}>{courseInfo?.title}</h3>
      </ListGroupItem>
      {courseInfo?.description?.length > 0 && <ListGroupItem>
        <p>{courseInfo?.description}</p>
      </ListGroupItem>}
    </ListGroup>
    <CardFooter><p className={styles.course_credits}>{courseInfo?.cores?.length > 0 && courseInfo?.cores?.join(', ') + " | "}Credits: {courseInfo?.creditAmount}</p></CardFooter>
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
      setSelectedCourses([...new Set([...selectedCourses, courseInfo.id])])
    } else {
      setSelectedCourses([...new Set(selectedCourses.filter((id) => id !== courseInfo.id))]);
    }
  }

  return (
  <Card className={styles.browser_course}>
    <CardHeader>
      <p className={styles.browser_course_id}>{courseInfo?.id || "No Title"}</p>
      <FormGroup check className={styles.course_select_toggle}>
        <Label check><Input type="checkbox" defaultChecked={false} onChange={(e) => updateSelection(e.target.checked)}></Input>{' '}Select</Label>
      </FormGroup>
    </CardHeader>
    <ListGroup flush>
      <ListGroupItem>
        <h3 className={styles.browser_course_title}>{courseInfo?.title}</h3>
      </ListGroupItem>
      <ListGroupItem>
        <p><b>PREREQUISITES: </b> {courseInfo?.prerequisites?.length === 0 && "NONE"}</p>
        {courseInfo?.prerequisites?.length > 0 && <ul>{courseInfo?.prerequisites?.map((courseId) => <li>{courseId}</li>)}</ul>}
      </ListGroupItem>
    </ListGroup>
    <CardFooter><p><b>{courseInfo?.cores?.length > 0 && courseInfo?.cores?.join(', ') + " | "}Credits: {courseInfo?.creditAmount}</b></p></CardFooter>
  </Card>) 
};

// Add Courses Form
const BrowserModal = ({addCourses, semesterViewingId, isBrowserActive, toggleFunction, semesterKeys, courseCatalog }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Filter logic; couldn't find a better way to initialize the core filters to false without a forEach loop. Spread operator wasn't working correctly
  const INIT_FILTERS = {FALL: false, SPRING: false, EVEN: false, ODD: false}
  cores.forEach((core) => INIT_FILTERS[core] = false);
  const [appliedFilters, setAppliedFilters] = useState(INIT_FILTERS);
  // SemesterViewingId is the semester the user is currently viewing outside of the modal
  const [semester, selectSemester] = useState(semesterViewingId);
  const CONTAINER_SIZE = 50;
  const COL_SIZE = 3;

  const reshapeFiltered = (filteredCatalog) => {
    const filteredReshaped = [];
    while (filteredCatalog.length) filteredReshaped.push(filteredCatalog.splice(0, COL_SIZE)); 
    return filteredReshaped
  }

  // Updates the displayedCourses by applying the selected filters and search queries
  const renderFilteredCourses = () => {
    setSelectedCourses([])
    // Checking whether the semester is an even or odd year and only adding courses that are offered in that year before applying filters
    const isEvenYear = parseInt(semester.charAt(semester.length-1)) % 2 === 0;
    let filteredCatalog = courseCatalog.filter((courseInfo) => (courseInfo?.yearOffered === "EVERY") || (isEvenYear ? courseInfo?.yearOffered === "EVEN" : courseInfo?.yearOffered === "ODD"));
    
    // Checking whether the semester is in the fall or the spring and adding courses offered in that season
    const isFall = semester.charAt(0) === "F";
    filteredCatalog = filteredCatalog.filter((courseInfo) => (courseInfo?.semesterOffered === "EVERY") || (isFall ? courseInfo?.semesterOffered  === "FALL" : courseInfo?.semesterOffered === "SPRING"));

    // Apply the remaining filters that the client enabled
    const appliedKeys = Object.keys(appliedFilters).filter((key) => appliedFilters[key]);
    filteredCatalog = filteredCatalog.filter((courseInfo) => appliedKeys.every((filterKey) => courseInfo?.yearOffered === filterKey || courseInfo?.semesterOffered === filterKey || courseInfo?.cores?.includes(filterKey)));
    
    // Apply the client's search query
    if (searchQuery.length > 0) {
      filteredCatalog = filteredCatalog.filter((courseInfo) => searchQuery.toLowerCase() === courseInfo?.title?.substring(0,searchQuery.length).toLowerCase() || searchQuery.toLowerCase() === courseInfo?.id?.substring(0,searchQuery.length).toLowerCase())
    }

    // Make the catalog a 2D array to help with the layout in the DOM
    filteredCatalog = reshapeFiltered(filteredCatalog);
    // Finally, only include the first 50 courses on the view
    filteredCatalog = filteredCatalog.slice(0, CONTAINER_SIZE);

    // Update the list of valid courses
    setDisplayedCourses(filteredCatalog);
  }


  // Update the displayed courses each time a changed is made to the appliedFilters
  useEffect(renderFilteredCourses, [appliedFilters, courseCatalog, semester])

  const addCoursesAction = (e) => {
    e.preventDefault();
    addCourses(selectedCourses, semester)
    resetModal()
  }
  
  const resetModal = () => {
    setSelectedCourses([]);
    toggleFunction();
  }

  return (
    <Modal isOpen={isBrowserActive} toggle={resetModal} fade={false}>
      <Form onSubmit={(e) => addCoursesAction(e)}>
        <ModalHeader toggle={resetModal} className={styles.browser_header}>Course Browser</ModalHeader>
        <ModalBody>
            {/* Semester Dropdown */}
            <FormGroup>
              <Label for="selectSemester">Select Semester:</Label>
              <Input type="select" name="select" id="selectSemester" defaultValue={semester} onChange={e => selectSemester(e.target.value)}>{semesterKeys.map((semesterId) => <option>{semesterId}</option>)}</Input>
            </FormGroup>
            {/* Filters */}
            <FormGroup check >
              <Row className={styles.filters_container}>
                {Object.keys(appliedFilters).map((filterKey) => (
                  <Col md={3}>
                    <Label check>
                      <Input type="checkbox" defaultChecked={appliedFilters[filterKey]} onChange={(e) => setAppliedFilters({...appliedFilters, [filterKey]: e.target.checked})}></Input>{' '}{filterKey}
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
                <Input type="text" onKeyPress={(e) => e.key==='Enter' && e.preventDefault()} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for a course by inputting its title or id!"></Input>
              </InputGroup>
            </FormGroup>
            {/* Course Container */}
            <div className={styles.course_container}>
              <p className={styles.course_container_title}>Course List</p>
              <Container fluid>
                {displayedCourses.map((courseInfoRow) => 
                  <Row className={styles.course_container_row}>{courseInfoRow.map((courseInfo) => <Col md={12/COL_SIZE}><BrowserCourse courseInfo={courseInfo} selectedCourses={selectedCourses} setSelectedCourses={setSelectedCourses} /></Col>)}</Row>
                )}
              </Container>
            </div>
        </ModalBody>
        <ModalFooter><Button color="primary" className={styles.add_courses} type="submit"><i className ="fa fa-calendar-plus-o fa-lg"></i>{'  '}ADD COURSES</Button></ModalFooter>
      </Form>
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
    this.props.authenticated ? this.props.fetchPlan() : this.props.dispatch(logoutAction); // Log out the user if their token expired
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
          <Row>
            {this.props.fullPlan[Object.keys(this.props.fullPlan)[this.state.semesterKey]].map((courseInfo) => 
              <Col md={3}><CourseInfo courseInfo={courseInfo} semesterKey={Object.keys(this.props.fullPlan)[this.state.semesterKey]} removeCourse={this.props.removeCourse}/></Col>
            )}
          </Row>
        </div>
        <BrowserModal addCourses={this.props.addCourses} semesterViewingId={Object.keys(this.props.fullPlan)[this.state.semesterKey]} isBrowserActive={this.state.isBrowserActive} toggleFunction={this.toggleBrowser} semesterKeys={Object.keys(this.props.fullPlan)} courseCatalog={this.props.courseCatalog} />
      </div>) 
    : <Spinner className={styles.load_spinner} color="primary" size="lg">{this.props.message || "Loading.."}</Spinner>
  }
}

Semester.propTypes = {};
Semester.defaultProps = {};

const mapStateToProps = (state) => {
  const { fullPlan, message, courseCatalog } = state.planReducer;
  const { authenticated, user } = state.authReducer;
  return {
    fullPlan: fullPlan,
    message: message,
    courseCatalog: courseCatalog,
    user: user,
    authenticated: authenticated
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPlan: () => dispatch(fetchPlanAction()),
    removeCourse: (courseId, semesterKey) => dispatch(removeCourseAction(courseId, semesterKey)),
    addCourses: (courseIdList, semesterKey) => dispatch(addCoursesAction(courseIdList, semesterKey)),
    logout: () => dispatch(logoutAction()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Semester);
