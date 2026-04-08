import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * AnimationWrapper — reusable GSAP fade-up wrapper.
 * Wraps any children and on mount applies a staggered
 * smooth fade-up to each direct child element.
 *
 * Props:
 *   props.children  — content to animate
 *   props.stagger   — delay between each child (default 0.1)
 *   props.delay     — initial delay before animation (default 0)
 *   props.className — optional extra class on the wrapper div
 */
function AnimationWrapper(props) {
  var children = props.children;
  var stagger = props.stagger !== undefined ? props.stagger : 0.1;
  var delay = props.delay !== undefined ? props.delay : 0;
  var className = props.className || '';

  var wrapperRef = useRef(null);

  useEffect(function () {
    if (!wrapperRef.current) return;

    var el = wrapperRef.current;

    // Animate the wrapper itself if it has only one child,
    // otherwise stagger all direct children
    var targets = el.children.length > 0 ? el.children : [el];

    gsap.fromTo(
      targets,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: stagger,
        delay: delay,
        clearProps: 'transform',
      }
    );
  }, []);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}

export default AnimationWrapper;
