import React from 'react';
import Semester from '../../components/Semester/Semester';
import styles from './Planner.module.css';

const Planner = () => (
  <div className={styles.Planner}>
    <Semester />
  </div>
);

Planner.propTypes = {};

Planner.defaultProps = {};

export default Planner;
