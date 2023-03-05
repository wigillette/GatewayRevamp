import React, { lazy, Suspense } from 'react';

const LazySemester = lazy(() => import('./Semester'));

const Semester = props => (
  <Suspense fallback={null}>
    <LazySemester {...props} />
  </Suspense>
);

export default Semester;
