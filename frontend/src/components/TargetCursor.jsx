import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

/**
 * TargetCursor — reactbits.dev TargetCursor implementation.
 * Four corner brackets that snap to any element with class "cursor-target".
 * Uses mix-blend-mode: difference for a color-inverting white cursor effect.
 *
 * Props:
 *   targetSelector   — CSS selector for hover targets (default '.cursor-target')
 *   spinDuration     — rotation loop speed in seconds (default 2)
 *   hideDefaultCursor — hide the system cursor (default true)
 *   hoverDuration    — ease duration for snapping to target (default 0.2)
 *   parallaxOn       — whether parallax lag is active on corners (default true)
 *
 * RSM JS Style: function declaration, no destructuring, no arrow functions.
 */
function TargetCursor(props) {
  var targetSelector = props.targetSelector !== undefined ? props.targetSelector : '.cursor-target';
  var spinDuration = props.spinDuration !== undefined ? props.spinDuration : 2;
  var hideDefaultCursor = props.hideDefaultCursor !== undefined ? props.hideDefaultCursor : true;
  var hoverDuration = props.hoverDuration !== undefined ? props.hoverDuration : 0.2;
  var parallaxOn = props.parallaxOn !== undefined ? props.parallaxOn : true;

  var cursorRef = useRef(null);
  var cornersRef = useRef(null);
  var spinTl = useRef(null);
  var dotRef = useRef(null);

  var isActiveRef = useRef(false);
  var targetCornerPositionsRef = useRef(null);
  var tickerFnRef = useRef(null);
  var activeStrengthRef = useRef(0);

  var isMobile = useMemo(function () {
    var hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var isSmallScreen = window.innerWidth <= 768;
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    var isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  var constants = useMemo(function () {
    return { borderWidth: 3, cornerSize: 12 };
  }, []);

  var moveCursor = useCallback(function (x, y) {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x: x,
      y: y,
      duration: 0.1,
      ease: 'power3.out',
    });
  }, []);

  useEffect(function () {
    if (isMobile || !cursorRef.current) return;

    var originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    var cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    var activeTarget = null;
    var currentLeaveHandler = null;
    var resumeTimeout = null;

    function cleanupTarget(target) {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    }

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    function createSpinTimeline() {
      if (spinTl.current) {
        spinTl.current.kill();
      }
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursor, {
        rotation: '+=360',
        duration: spinDuration,
        ease: 'none',
      });
    }

    createSpinTimeline();

    var tickerFn = function () {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) {
        return;
      }
      var strength = activeStrengthRef.current;
      if (strength === 0) return;

      var cursorX = gsap.getProperty(cursorRef.current, 'x');
      var cursorY = gsap.getProperty(cursorRef.current, 'y');

      var corners = Array.from(cornersRef.current);
      corners.forEach(function (corner, i) {
        var currentX = gsap.getProperty(corner, 'x');
        var currentY = gsap.getProperty(corner, 'y');

        var targetX = targetCornerPositionsRef.current[i].x - cursorX;
        var targetY = targetCornerPositionsRef.current[i].y - cursorY;

        var finalX = currentX + (targetX - currentX) * strength;
        var finalY = currentY + (targetY - currentY) * strength;

        var duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto',
        });
      });
    };

    tickerFnRef.current = tickerFn;

    function moveHandler(e) {
      moveCursor(e.clientX, e.clientY);
    }
    window.addEventListener('mousemove', moveHandler);

    function scrollHandler() {
      if (!activeTarget || !cursorRef.current) return;
      var mouseX = gsap.getProperty(cursorRef.current, 'x');
      var mouseY = gsap.getProperty(cursorRef.current, 'y');
      var elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      var isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget ||
          elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        if (currentLeaveHandler) {
          currentLeaveHandler();
        }
      }
    }
    window.addEventListener('scroll', scrollHandler, { passive: true });

    function mouseDownHandler() {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    }

    function mouseUpHandler() {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    }

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    function enterHandler(e) {
      var directTarget = e.target;
      var allTargets = [];
      var current = directTarget;
      while (current && current !== document.body) {
        if (current.matches && current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      var target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      var corners = Array.from(cornersRef.current);
      corners.forEach(function (corner) {
        gsap.killTweensOf(corner);
      });

      gsap.killTweensOf(cursorRef.current, 'rotation');
      if (spinTl.current) spinTl.current.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      var rect = target.getBoundingClientRect();
      var borderWidth = constants.borderWidth;
      var cornerSize = constants.cornerSize;
      var cursorX = gsap.getProperty(cursorRef.current, 'x');
      var cursorY = gsap.getProperty(cursorRef.current, 'y');

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFnRef.current);

      gsap.to(activeStrengthRef, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out',
      });

      corners.forEach(function (corner, i) {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current[i].x - cursorX,
          y: targetCornerPositionsRef.current[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out',
        });
      });

      function leaveHandler() {
        gsap.ticker.remove(tickerFnRef.current);

        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef, { current: 0, overwrite: true });
        activeTarget = null;

        if (cornersRef.current) {
          var leavingCorners = Array.from(cornersRef.current);
          gsap.killTweensOf(leavingCorners);
          var cornerSz = constants.cornerSize;
          var positions = [
            { x: -cornerSz * 1.5, y: -cornerSz * 1.5 },
            { x: cornerSz * 0.5, y: -cornerSz * 1.5 },
            { x: cornerSz * 0.5, y: cornerSz * 0.5 },
            { x: -cornerSz * 1.5, y: cornerSz * 0.5 },
          ];
          var tl = gsap.timeline();
          leavingCorners.forEach(function (corner, index) {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out',
              },
              0
            );
          });
        }

        resumeTimeout = setTimeout(function () {
          if (!activeTarget && cursorRef.current && spinTl.current) {
            var currentRotation = gsap.getProperty(cursorRef.current, 'rotation');
            var normalizedRotation = currentRotation % 360;
            spinTl.current.kill();
            spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
              rotation: '+=360',
              duration: spinDuration,
              ease: 'none',
            });
            gsap.to(cursorRef.current, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: function () {
                if (spinTl.current) spinTl.current.restart();
              },
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      }

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    }

    window.addEventListener('mouseover', enterHandler, { passive: true });

    return function () {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
      }
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      if (spinTl.current) spinTl.current.kill();
      document.body.style.cursor = originalCursor;

      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current = 0;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn]);

  useEffect(function () {
    if (isMobile || !cursorRef.current || !spinTl.current) return;
    if (spinTl.current.isActive()) {
      spinTl.current.kill();
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
        rotation: '+=360',
        duration: spinDuration,
        ease: 'none',
      });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
}

export default TargetCursor;
