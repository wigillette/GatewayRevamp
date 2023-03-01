import React, { lazy, Suspense } from 'react';

const LazyHomeCarousel = lazy(() => import('./HomeCarousel'));

const HomeCarousel = props => (
  <Suspense fallback={null}>
    <LazyHomeCarousel {...props} />
  </Suspense>
);

export default HomeCarousel;
