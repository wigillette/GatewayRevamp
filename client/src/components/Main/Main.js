import React from 'react';
import styles from './Main.module.css';
import { Route, Routes } from 'react-router-dom';
import HomePage from "../../routes/Home/Home"
import PlannerPage from "../../routes/Planner/Planner";
import ProgressPage from "../../routes/Progress/Progress";
import Header from "../Header/Header";
import { AuthenticationGuard } from '../Authentication/authentication-guard';

const Main = () => (
  <div className={styles.Main}>
    <Header/>
    <div className="content-wrapper">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/home" element={<HomePage/>} />
        <Route path="/progress" element={<AuthenticationGuard component={ProgressPage}/>} />
        <Route path="/planner" element={<AuthenticationGuard component={PlannerPage}/>} />
      </Routes>
    </div>
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
