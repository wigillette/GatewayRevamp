import React from 'react';
import styles from './Footer.module.css';
import { Container, Row, Col, Navbar, NavbarBrand } from 'reactstrap';

const LinkTower = ({heading, linkList}) => (
  <Col className={styles.link_tower}>
    <p className={styles.tower_heading}>{heading}</p>
    {linkList.map((linkData) => <a href={linkData.url} className={styles.tower_link}>{linkData.title}</a>)}
  </Col>
)

const Footer = () => (
  <div className={styles.footer_wrapper}>
    <Navbar className={styles.footer}>
      <Container className={styles.tower_container}>
        {/* <NavbarBrand className={styles.brand}>
          <h4 className={styles.footer_title}>A Modernized Degree Planning Software</h4>
        </NavbarBrand> */}
        <Row className={styles.tower_row}>
          <LinkTower heading={"About Us"} linkList={[{url: "/", title: "Example"}]} />
          <LinkTower heading={"Services"} linkList={[{url: "/", title: "Example"}]} />
          <LinkTower heading={"Contact Us"} linkList={[{url: "/", title: "Example"}]} />
          <LinkTower heading={"Social Media"} linkList={[{url: "/", title: "Example"}]} />
        </Row>
        <Row className={styles.footer_divider}><hr></hr></Row>
      </Container>
      <Container className={styles.footer_credit}><Row><p>&copy;{new Date().getFullYear()} Ursinus Student Access Portal | All rights reserved</p></Row></Container>
    </Navbar>
  </div>
);

Footer.propTypes = {};

Footer.defaultProps = {};

export default Footer;