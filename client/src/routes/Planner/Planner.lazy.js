import React, { lazy, Suspense } from 'react';

const LazyPlanner = lazy(() => import('./Planner'));

const Planner = props => (
  <Suspense fallback={null}>
    <LazyPlanner {...props} />
  </Suspense>
);

export default Planner;
