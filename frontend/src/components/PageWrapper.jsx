import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function PageWrapper(props) {
  var children = props.children;
  var wrapperRef = useRef(null);

  useEffect(function () {
    gsap.fromTo(
      wrapperRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.52, ease: 'power3.out', clearProps: 'transform' }
    );
  }, []);

  return (
    <div ref={wrapperRef} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}

export default PageWrapper;
