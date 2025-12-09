import React, { useState, useEffect, useRef } from "react";

/**
 * 단일 컬러별 결과 이미지를 세로 방향 coverflow 형태로 보여주는 컴포넌트
 * @param {{ images: { id: string; url: string; label?: string }[], activeId?: string, onActiveChange?: (id: string) => void }} props
 */
const ResultCoverFlow = ({ images, activeId, onActiveChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartY = useRef(null);
  const mouseDragStartY = useRef(null);
  const wheelBlockedUntilRef = useRef(0);
  const rootRef = useRef(null);
  const [loadedMap, setLoadedMap] = useState({});

  // 이미지 배열이 바뀌면 인덱스를 0으로 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // 외부에서 activeId 가 주어지면 동기화
  useEffect(() => {
    if (!activeId || !images || images.length === 0) return;
    const idx = images.findIndex((img) => img.id === activeId);
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
  }, [activeId, images]);

  // 사용자 인터랙션으로 인덱스를 변경할 때만 상위에 active 변경 알림
  const setIndexFromUser = (updater) => {
    setCurrentIndex((prev) => {
      const nextIndex = typeof updater === "function" ? updater(prev) : updater;
      if (images && images[nextIndex] && onActiveChange) {
        onActiveChange(images[nextIndex].id);
      }
      return nextIndex;
    });
  };

  // wheel 이벤트를 passive: false로 등록해야 preventDefault()가 작동함
  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    const handleWheel = (e) => {
      // 전체 페이지 스크롤이 일어나지 않도록 기본 동작/버블링을 막는다.
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      const BLOCK_MS = 400; // 한 번 이동 후 이 시간 동안은 추가 이동을 완전히 차단

      // 아직 차단 기간이면 이벤트 무시
      if (now < wheelBlockedUntilRef.current) {
        return;
      }

      const dy = e.deltaY;
      // 미세한 움직임은 무시
      if (Math.abs(dy) < 8) return;

      // 방향에 따라 인덱스를 정확히 한 칸만 이동
      if (dy > 0) {
        setIndexFromUser((prev) => Math.min(prev + 1, images.length - 1));
      } else {
        setIndexFromUser((prev) => Math.max(prev - 1, 0));
      }

      // 다음 이동까지 차단
      wheelBlockedUntilRef.current = now + BLOCK_MS;
    };

    // passive: false 옵션으로 등록해야 preventDefault()가 작동함
    rootEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      rootEl.removeEventListener("wheel", handleWheel);
    };
  }, [images]);

  if (!images || images.length === 0) return null;

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    // 터치 스와이프 시에도 전체 페이지 스크롤이 발생하지 않도록 막는다.
    e.preventDefault();
    e.stopPropagation();

    if (touchStartY.current == null) return;
    const diff = touchStartY.current - e.touches[0].clientY;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setIndexFromUser((prev) => Math.min(prev + 1, images.length - 1));
      } else {
        setIndexFromUser((prev) => Math.max(prev - 1, 0));
      }
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleMouseDown = (e) => {
    // 마우스 드래그로도 위/아래로 색상을 전환할 수 있도록 시작 좌표를 기억
    e.preventDefault();
    e.stopPropagation();
    mouseDragStartY.current = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (mouseDragStartY.current == null) return;
    e.preventDefault();
    e.stopPropagation();
    const diff = mouseDragStartY.current - e.clientY;
    const DRAG_THRESHOLD = 40;
    if (Math.abs(diff) > DRAG_THRESHOLD) {
      if (diff > 0) {
        setIndexFromUser((prev) => Math.min(prev + 1, images.length - 1));
      } else {
        setIndexFromUser((prev) => Math.max(prev - 1, 0));
      }
      mouseDragStartY.current = e.clientY;
    }
  };

  const handleMouseUp = () => {
    mouseDragStartY.current = null;
  };

  return (
    <div
      ref={rootRef}
      className="result-coverflow-root"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="result-coverflow-stack">
        {images.map((img, index) => {
          const offset = index - currentIndex;
          const absOffset = Math.abs(offset);

          if (absOffset > 4) return null;

          const yBase = 90;
          const zBase = -100;
          const rotBase = 45;

          const translateY = offset * yBase;
          const translateZ = absOffset * zBase;
          const rotateX = -offset * rotBase * 0.8;
          const scale = Math.max(0.7, 1 - absOffset * 0.1);
          const opacity = Math.max(0, 1 - absOffset * 0.3);
          const zIndex = 100 - absOffset;

          return (
            <div
              key={img.id}
              className={`result-coverflow-card ${offset === 0 ? "result-coverflow-card-active" : ""}`}
              style={{
                transform: `
                  perspective(1200px)
                  translate3d(0, ${translateY}px, ${translateZ}px)
                  rotateX(${rotateX}deg)
                  scale(${scale})
                `,
                zIndex,
                opacity,
              }}
              onClick={() => setIndexFromUser(index)}
            >
              <div className="result-coverflow-image-wrapper">
                {img.url ? (
                  <>
                    {!loadedMap[img.id] && (
                      <div className="result-coverflow-loading">
                        <div className="circular-loader-sm" />
                        <div className="result-coverflow-loading-text">이미지를 불러오는 중입니다...</div>
                      </div>
                    )}
                    <img
                      src={img.url}
                      alt={img.label || img.id}
                      className="result-coverflow-image"
                      onLoad={() =>
                        setLoadedMap((prev) => ({
                          ...prev,
                          [img.id]: true,
                        }))
                      }
                      style={{
                        opacity: loadedMap[img.id] ? 1 : 0,
                        transition: "opacity 0.25s ease",
                      }}
                    />
                    <div className="result-coverflow-shine" />
                  </>
                ) : (
                  <div className="result-coverflow-loading">
                    <div className="circular-loader-sm" />
                    <div className="result-coverflow-loading-text">결과를 생성하는 중입니다...</div>
                  </div>
                )}
              </div>

              <div
                className={`result-coverflow-label ${offset === 0 ? "result-coverflow-label-active" : "result-coverflow-label-inactive"}`}
              >
                <span>{img.label || img.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="result-coverflow-indicators">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            type="button"
            className={`result-coverflow-indicator ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setIndexFromUser(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultCoverFlow;
