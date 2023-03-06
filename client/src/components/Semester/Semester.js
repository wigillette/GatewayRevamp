import React, { useEffect, useState } from 'react';
import styles from './Semester.module.css';
import { Card, CardHeader, ListGroup, ListGroupItem, Button, CardFooter, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledAlert } from 'reactstrap';
import { connect } from 'react-redux';
import { removeCourseAction, addCoursesAction, fetchPlanAction } from '../../redux/actions/planner';
/* Idea is to structure courses within plannedCourses as courseInfo dictionaries:
   semesterPlan: [{
              id: string
              title: string,
              description: string,
              cores: string[],
              creditAmount: number
              }, ...]
*/
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

class Semester extends React.Component {
  constructor(props) {
    super(props);
    this.state = {semesterKey: 0}
    this.setSemesterKey = this.setSemesterKey.bind(this);
  }

  setSemesterKey(key) { 
    this.setState({semesterKey: key})
  };

  componentDidMount() { // Using a class component here to fetch the initial plan upon mounting the semester component
    this.props.fetchPlan();
  }

  render() {
    return (this.props.fullPlan && Object.keys(this.props.fullPlan).length > 0) ? (
      <div className={styles.Semester}>
        <div className={styles.plan_header}>
          <h3 className={styles.semester_header}>{Object.keys(this.props.fullPlan)[this.state.semesterKey]} Course Plan</h3>
          <SemesterDropdown keyList={Object.keys(this.props.fullPlan)} activeIndex={this.state.semesterKey} setSemesterKey={this.setSemesterKey} />
          <Button color='primary' size="lg" onClick={() => alert("Opening Course Browser Form")} className={styles.browser_toggle}><span className ="fa fa-search fa-lg"></span>{'  '}COURSE BROWSER</Button>
          <hr className={styles.semester_divider}></hr>
        </div>
        {this.props.message && this.props.message.length > 0 && <UncontrolledAlert className={styles.message_notif} color="warning" fade={false}>{this.props.message}</UncontrolledAlert>}
        <div className={styles.plan_container}>
          {this.props.fullPlan[Object.keys(this.props.fullPlan)[this.state.semesterKey]].map((courseInfo) => 
            <CourseInfo courseInfo={courseInfo} semesterKey={Object.keys(this.props.fullPlan)[this.state.semesterKey]} removeCourse={this.props.removeCourse}/>
          )}
        </div>
      </div>) 
    : <p>Failed to initialize the full semester plan or display the specified semester's plan.</p>
  }
}

Semester.propTypes = {};

Semester.defaultProps = {};

const mapStateToProps = (state) => {
  const { fullPlan, message } = state.planReducer;
  console.log(fullPlan, message);
  return {
    fullPlan: fullPlan,
    message: message
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
