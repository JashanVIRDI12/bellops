"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

interface PoemAnimationProps {
  poemHTML: string;
  backgroundImageUrl: string;
  boyImageUrl: string;
  children?: React.ReactNode;
}

interface CubeProps {
  poemHTML: string;
  reflected?: boolean;
}

function Cube({ poemHTML, reflected = false }: CubeProps) {
  return (
    <div
      className={reflected ? "poem-animation__cube-wrap poem-animation__cube-wrap--reflect" : "poem-animation__cube-wrap"}
      aria-hidden="true"
    >
      <div className="poem-animation__cube">
        <div className="poem-animation__face poem-animation__face--top" />
        <div className="poem-animation__face poem-animation__face--bottom" />
        <div
          className="poem-animation__face poem-animation__face--left poem-animation__text"
          dangerouslySetInnerHTML={{ __html: poemHTML }}
        />
        <div
          className="poem-animation__face poem-animation__face--right poem-animation__text"
          dangerouslySetInnerHTML={{ __html: poemHTML }}
        />
        <div className="poem-animation__face poem-animation__face--front" />
        <div
          className="poem-animation__face poem-animation__face--back poem-animation__text"
          dangerouslySetInnerHTML={{ __html: poemHTML }}
        />
      </div>
    </div>
  );
}

/**
 * Renders a responsive, cinematic 3D text-room hero.
 * `poemHTML` must contain trusted, application-owned markup.
 */
export function PoemAnimation({
  poemHTML,
  backgroundImageUrl,
  boyImageUrl,
  children,
}: PoemAnimationProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;

    if (!frame || !content) return;

    let animationFrame = 0;

    const adjustContentSize = () => {
      const width = frame.clientWidth || window.innerWidth;
      const height = frame.clientHeight || window.innerHeight;
      const widthScale = width / 1000;
      const heightScale = height / 562;
      // Full-bleed cover calculation with safe margin to prevent any letterboxing
      const scaleFactor = Math.max(widthScale, heightScale) * 1.02;

      content.style.transform = `translate(-50%, -50%) scale(${scaleFactor})`;
    };

    const scheduleAdjustment = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(adjustContentSize);
    };

    adjustContentSize();

    const resizeObserver = new ResizeObserver(scheduleAdjustment);
    resizeObserver.observe(frame);
    window.addEventListener("resize", scheduleAdjustment, { passive: true });
    window.addEventListener("orientationchange", scheduleAdjustment, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleAdjustment);
      window.removeEventListener("orientationchange", scheduleAdjustment);
    };
  }, []);

  const hideBrokenImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <header className="poem-animation">
      <div ref={frameRef} className="poem-animation__frame">
        <div
          ref={contentRef}
          className="poem-animation__content"
          style={{ display: "block", width: "1000px", height: "562px" }}
        >
          <div className="poem-animation__scene">
            <Image
              className="poem-animation__background"
              src={backgroundImageUrl}
              alt=""
              fill
              sizes="100vw"
              preload
              onError={hideBrokenImage}
            />
            <Cube poemHTML={poemHTML} />
            <Cube poemHTML={poemHTML} reflected />
            <Image
              className="poem-animation__figures"
              src={boyImageUrl}
              alt=""
              fill
              sizes="100vw"
              onError={hideBrokenImage}
            />
            <div className="poem-animation__hue" aria-hidden="true" />
            <div className="poem-animation__vignette" aria-hidden="true" />
          </div>
        </div>
      </div>

      {children}
    </header>
  );
}
