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
    <Navbar className={styles.Footer} fixed='bottom'>
      <Container className={styles.tower_container}>
        <NavbarBrand>
          <h4 className={styles.footer_title}>A Modernized Degree Planning Software</h4>
        </NavbarBrand>
        <Row className={styles.tower_row}>
          <LinkTower heading={"About Us"} linkList={[{url: "/", title: "Aim"}, {url: "/", title: "Vision"}, {url: "/", title: "Testimonials"}]} />
          <LinkTower heading={"Services"} linkList={[{url: "/", title: "Writing"}, {url: "/", title: "Internships"}, {url: "/", title: "Coding"}, {url: "/", title: "Teaching"}]} />
          <LinkTower heading={"Contact Us"} linkList={[{url: "/", title: "Will"}, {url: "/", title: "Jess"}, {url: "/", title: "Kacey"}, {url: "/", title: "Ryan"}, {url: "/", title: "Matt"}]} />
        </Row>
        <Row><hr className={styles.footer_divider}></hr></Row>
      </Container>
      <Container className={styles.footer_credit}><Row><p>&copy;{new Date().getFullYear()} Ursinus Student Access Portal | All rights reserved</p></Row></Container>
    </Navbar>
);

Footer.propTypes = {};

Footer.defaultProps = {};

export default Footer;

/*
export const Box = styled.div`
  padding: 80px 60px;
  background: black;
  position: absolute;
  bottom: 0;
  width: 100%;
  
   
  @media (max-width: 1000px) {
    padding: 70px 30px;
  }
`;
*/