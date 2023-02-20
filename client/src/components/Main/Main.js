import React from 'react';
import styles from './Main.module.css';
import { Route, Routes } from 'react-router-dom';
import HomePage from "../../routes/Home/Home"
import PlannerPage from "../../routes/Planner/Planner";
import ProgressPage from "../../routes/Progress/Progress";
import Header from "../Header/Header";

const Main = () => (
  <div className={styles.Main}>
    {/* Header */}
    <Header/>
    <div className="content-wrapper">
      {/* React Router */}
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/progress" element={<ProgressPage/>} />
        <Route path="/planner" element={<PlannerPage/>} />
      </Routes>
    </div>
    {/* Add Footer */}
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
