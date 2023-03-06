import React, { useState } from 'react';
import styles from './Semester.module.css';
import { Card, CardHeader, ListGroup, ListGroupItem, Button, CardFooter, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { removeCourse } from '../../services/plan-service';
/* Idea is to structure courses within plannedCourses as courseInfo dictionaries:
   semesterPlan: [{
              id: string
              title: string,
              description: string,
              cores: string[],
              creditAmount: number
              }, ...]
*/
const CourseInfo = ({courseInfo, semesterKey, message, dispatch}) => {
  const attemptCourseRemoval = (courseId) => {
    console.log(courseId, semesterKey);
    dispatch(removeCourse(courseId, semesterKey))
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
  <UncontrolledButtonDropdown className='me-2' direction='up'>
    <DropdownToggle caret color='primary'><p className={styles.semester_title}>Semester Viewing</p></DropdownToggle>
    <DropdownMenu>
      {keyList.map((semesterKey, index) => (<DropdownItem onClick={() => setSemesterKey(index)} divider active={semesterKey === keyList[activeIndex]}>
        <p className={styles.semester_label}>{semesterKey}</p>
      </DropdownItem>))}
    </DropdownMenu>
  </UncontrolledButtonDropdown>
)

const Semester = ({fullPlan, message, dispatch}) => {
  const [semesterKey, setSemesterKey] = useState(0);

  // Adding a check here to see if the fullPlan prop was correctly initialized
  return (Object.keys(fullPlan).length > 0 && Object.keys(fullPlan).includes(semesterKey)) ? (
      <div className={styles.Semester}>
        <h3 className={styles.semester_header}>{Object.keys(fullPlan)[semesterKey]} Course Plan</h3>
        <SemesterDropdown keyList={Object.keys(fullPlan)} activeIndex={semesterKey} setSemesterKey={setSemesterKey} />
        <div className={styles.plan_container}>
          {fullPlan[Object.keys(fullPlan)[semesterKey]].map((courseInfo) => 
            <CourseInfo courseInfo={courseInfo} semesterKey={Object.keys(fullPlan)[semesterKey]} message={message} dispatch={dispatch}/>
          )}
        </div>
      </div>) 
    : <p>Failed to initialize the full semester plan or display the specified semester's plan.</p>
};

Semester.propTypes = {};

Semester.defaultProps = {};

const mapStateToProps = (state) => {
  const { fullPlan, message } = state.planReducer;
  return {
    fullPlan: fullPlan,
    message: message
  }
}

export default connect(mapStateToProps)(Semester);
