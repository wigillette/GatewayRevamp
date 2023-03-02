import React from 'react'
import { Outlet, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';

const ProtectedRoute = ({ isAuthenticated, dispatch }) => {console.log(isAuthenticated); return isAuthenticated ? <Outlet /> : <Navigate to={"/home"} replace />};
const mapStateToProps = (state) => ({ isAuthenticated: state.authReducer.authenticated });
export default connect(mapStateToProps)(ProtectedRoute);