import React, { useState } from 'react';
import styles from './Progress.module.css';
import {Button, Form, Modal, Progress} from 'reactstrap';
import { assignCore } from '../../services/progress-service';

const CoreAssignmentForm = ({isAssignmentOpen, toggleFunction, selectedCoreId, selectCore}) => {
  const [courseId, setCourseId] = useState(null);
  const assignCoreAction = (e) => {
    e.preventDefault();
    if (courseId && selectedCoreId) {
      assignCore(courseId, selectedCoreId);
      selectCore("A");
      toggleFunction();
    } else {
      alert("Invalid parameters");
    }
  }

  return (<Modal isOpen={isAssignmentOpen} fade={false}>
    <Form onSubmit={(e) => assignCoreAction(e)}></Form>
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
    this.setState({...this.state, toggleAssignment: !this.state.toggleAssignment})
  }

  render() {
    return (<div className={styles.Progress}>
      <div className={styles.ProgressHeader}>
        <div className={styles.ProgressBarContainer}>
          <div className='text-center'>{`${Math.floor(100*this.props.totalCredits/128)}%`}</div>
          <Progress color="success" value={Math.floor(100*this.props.totalCredits/128)} />
        </div>
        <Button color='primary' size="lg" onClick={this.toggleAssignment} className={styles.browser_toggle}><span className ="fa fa-plus-circle fa-lg"></span>{' '}ASSIGN REQUIREMENT</Button>
        <CoreAssignmentForm isAssignmentOpen={this.state.isAssignmentOpen} toggleFunction={this.toggleAssignment} selectedCoreId={this.state.currentCoreId} selectCore={this.selectCore} />
      </div>
    </div>)
  }
}

export default ProgressContainer;
