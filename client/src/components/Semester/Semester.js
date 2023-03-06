import React, { useEffect, useState } from 'react';
import styles from './Semester.module.css';
import { Card, CardHeader, ListGroup, ListGroupItem, Button, CardFooter, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
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
const CourseInfo = ({courseInfo, semesterKey, message, removeCourse}) => {
  const attemptCourseRemoval = (courseId) => {
    removeCourse(courseId, semesterKey)
    .then(() => alert(message))
    .catch((err) => alert(message));
  }

  return (<Card className={styles.course_info}>
    <CardHeader><p className={styles.semester_title}>{courseInfo?.title || "No Title"}</p></CardHeader>
    <Button className={styles.remove_course} onClick={() => courseInfo?.id ? attemptCourseRemoval(courseInfo.id) : alert("Invalid Course")}>
      <p className={styles.semester_label}>Remove Course</p>
    </Button>
    <ListGroup flush>
      <ListGroupItem>
        <p className={styles.semester_label}>{courseInfo?.description || "No Description"}</p>
      </ListGroupItem>
      <ListGroupItem>
        <p className={styles.semester_label}>{courseInfo?.cores ? courseInfo.cores.join(', ') : "No Core Requirements" }</p>
      </ListGroupItem>
    </ListGroup>
    <CardFooter><p className={styles.course_credits}>{courseInfo.creditAmount}</p></CardFooter>
  </Card>)
}

const SemesterDropdown = ({keyList, activeIndex, setSemesterKey}) => (
  <UncontrolledButtonDropdown className='me-2' direction='down'>
    <DropdownToggle caret color='primary'><p className={styles.semester_title}>Semester Viewing</p></DropdownToggle>
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
    return (Object.keys(this.props.fullPlan).length > 0) ? (
      <div className={styles.Semester}>
        <h3 className={styles.semester_header}>{Object.keys(this.props.fullPlan)[this.state.semesterKey]} Course Plan</h3>
        <SemesterDropdown keyList={Object.keys(this.props.fullPlan)} activeIndex={this.state.semesterKey} setSemesterKey={this.setSemesterKey} />
        <div className={styles.plan_container}>
          {this.props.fullPlan[Object.keys(this.props.fullPlan)[this.state.semesterKey]].map((courseInfo) => 
            <CourseInfo courseInfo={courseInfo} semesterKey={Object.keys(this.props.fullPlan)[this.state.semesterKey]} message={this.props.message} removeCourse={this.props.removeCourse}/>
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
  return {
    fullPlan: fullPlan,
    message: message
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPlan: () => dispatch(fetchPlanAction()),
    removeCourse: (courseId, semesterKey) => dispatch(removeCourseAction(courseId, semesterKey))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Semester);
