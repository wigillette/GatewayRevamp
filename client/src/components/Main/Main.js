import React from 'react';
import styles from './Main.module.css';
import { Route, Routes, withRouter } from 'react-router-dom';
import HomePage from "../../routes/Home/Home"
import Header from "../Header/Header";

const Main = () => (
  <div className={styles.Main}>
    <Header/>
    <div className="content-wrapper">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/home" element={<HomePage/>} />
      </Routes>
    </div>
  </div>
);

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
