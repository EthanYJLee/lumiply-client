import React, { useEffect, useRef, useState } from "react";

/**
 * 원본 / 결과 이미지를 한 컨테이너 안에서 슬라이더로 비교하는 컴포넌트입니다.
 *
 * - 마우스/터치 위치를 기반으로 슬라이더 핸들의 위치를 계산합니다.
 * - 두 이미지가 모두 로드되기 전까지는 로딩 오버레이를 띄워 "스트리밍"되는 느낌을 줄입니다.
 *
 * originalUrl / resultImageUrl 이 둘 다 유효하지 않으면 null 을 반환해 렌더링을 건너뜁니다.
 */
const ResultComparison = ({ originalUrl, resultImageUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 ~ 100 (%)
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [resultLoaded, setResultLoaded] = useState(false);

  const updateSliderFromClientX = (clientX) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const percent = (relativeX / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    if (e.touches[0]) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    if (e.touches[0]) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!originalUrl || !resultImageUrl) {
    return null;
  }

  return (
    <div className="comparison-slider-container" ref={containerRef} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      <img
        src={originalUrl}
        alt="Original"
        className="comparison-image comparison-image-original"
        onLoad={() => setOriginalLoaded(true)}
        style={{
          opacity: originalLoaded ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />
      <img
        src={resultImageUrl}
        alt="Result"
        className="comparison-image comparison-image-result"
        onLoad={() => setResultLoaded(true)}
        style={{
          clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          opacity: resultLoaded ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />
      {(!originalLoaded || !resultLoaded) && (
        <div className="comparison-loading-overlay">
          <div className="circular-loader-lg" />
          <div className="comparison-loading-text">이미지를 불러오는 중입니다...</div>
        </div>
      )}
      <div
        className="comparison-slider-handle"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="comparison-slider-bar" />
      </div>
    </div>
  );
};

export default ResultComparison;
