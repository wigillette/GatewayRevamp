import React, { lazy, Suspense } from 'react';

const LazyProgress = lazy(() => import('./Progress'));

const Progress = props => (
  <Suspense fallback={null}>
    <LazyProgress {...props} />
  </Suspense>
);

export default Progress;
