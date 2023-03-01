import React from 'react';
import HomeCarousel from '../../components/Home/HomeCarousel/HomeCarousel';
import styles from './Home.module.css';

const Home = () => (
  <div className={styles.Home}>
    <HomeCarousel />
  </div>
);

Home.propTypes = {};

Home.defaultProps = {};

export default Home;
