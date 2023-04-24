import React, {useState} from 'react';
import styles from './HomeCarousel.module.css';

import {
  Carousel,
  CarouselItem,
  CarouselCaption,
} from 'reactstrap';

import UC1 from "../../../images/UC1.jpg"
import UC2 from "../../../images/UC2.jpg"
import UC3 from "../../../images/UC3.jpg"
import UC4 from "../../../images/UC4.jpg"

const items = [
  {
    src: UC1,
    altText: 'Campus Life',
    caption: 'Campus Life',
    key: 1,
  },
  {
    src: UC2,
    altText: 'IDC',
    caption: 'Innovation and Discovery Center',
    key: 2,
  },
  {
    src: UC3,
    altText: 'UImagine',
    caption: 'U-Imagine Center',
    key: 3,
  },
  {
    src: UC4,
    altText: 'Lab',
    caption: 'Pfahler Laboratory',
    key: 4,
  },
];

const HomeCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = () => {
    if (!animating) {
      const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
      setActiveIndex(nextIndex);
    }
  };

  const previous = () => {
    if (!animating) {
      const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
      setActiveIndex(nextIndex);
    }
  };

  return (
    <Carousel
      activeIndex={activeIndex}
      next={next}
      previous={previous}
      fade = {true}
      slide = {true}
      className={styles.HomeCarousel}
    >
      
      {items.map((item) => 
        <CarouselItem
          onExiting={() => setAnimating(true)}
          onExited={() => setAnimating(false)}
          key={item.src}
        >
          <img src={item.src} alt={item.altText} className={styles.carousel_image} />
          <CarouselCaption captionHeader={item.caption} />
        </CarouselItem>
      )}
    </Carousel>
  );
}

export default HomeCarousel;
