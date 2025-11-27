import { useRef, useState, useCallback } from "react";
import { DRAG_THRESHOLD } from "../constants/defaultValues";

/**
 * 드래그 앤 드롭 기능을 위한 커스텀 훅
 * @param {Function} onLightDrop - 조명 드롭 핸들러
 * @param {Function} onLightDrag - 조명 드래그 핸들러
 * @param {Function} onLightResize - 조명 리사이즈 핸들러
 * @param {Function} onLightSelect - 조명 선택 핸들러
 * @param {Object} mainImageRef - main-image ref
 * @returns {Object} 드래그 관련 refs 및 핸들러
 */
export const useDragAndDrop = (onLightDrop, onLightDrag, onLightResize, onLightSelect, mainImageRef) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPosRef = useRef(null);
  const dragStartLightIdRef = useRef(null);
  const resizeStartSizeRef = useRef(null);
  const draggedLightRef = useRef(null);
  const imageContainerRef = useRef(null);

  /**
   * 조명 드래그 시작
   */
  const handleLightDragStart = useCallback((e, lightPath) => {
    e.preventDefault();
    draggedLightRef.current = lightPath;
  }, []);

  /**
   * main-image의 실제 bounds를 계산하는 함수
   */
  const getMainImageBounds = useCallback(() => {
    if (!imageContainerRef.current || !mainImageRef?.current) {
      return null;
    }

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const imageRect = mainImageRef.current.getBoundingClientRect();

    // main-image가 container 내에서 실제로 차지하는 영역 계산
    const imageLeft = imageRect.left - containerRect.left;
    const imageTop = imageRect.top - containerRect.top;
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;

    return {
      left: imageLeft,
      top: imageTop,
      width: imageWidth,
      height: imageHeight,
      containerWidth: containerRect.width,
      containerHeight: containerRect.height,
    };
  }, [mainImageRef]);

  /**
   * 이미지에 조명 드롭
   */
  const handleImageDrop = useCallback(
    (e) => {
      e.preventDefault();
      if (draggedLightRef.current && imageContainerRef.current) {
        const bounds = getMainImageBounds();
        if (!bounds) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
          onLightDrop(draggedLightRef.current, { x, y });
          draggedLightRef.current = null;
          return;
        }

        const containerRect = imageContainerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;

        // main-image 범위 내로 제한
        const clampedX = Math.max(bounds.left, Math.min(bounds.left + bounds.width, relativeX));
        const clampedY = Math.max(bounds.top, Math.min(bounds.top + bounds.height, relativeY));

        // container 기준으로 퍼센트 계산
        const x = (clampedX / bounds.containerWidth) * 100;
        const y = (clampedY / bounds.containerHeight) * 100;

        onLightDrop(draggedLightRef.current, { x, y });
      }
      draggedLightRef.current = null;
    },
    [onLightDrop, getMainImageBounds]
  );

  /**
   * 드래그 오버 핸들러
   */
  const handleImageDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  /**
   * 조명 오버레이 마우스 다운 (드래그 시작)
   */
  const handleOverlayMouseDown = useCallback(
    (e, lightId) => {
      // 제거 버튼이나 리사이즈 핸들을 클릭한 경우 무시
      if (e.target.closest(".light-remove-btn") || e.target.closest(".light-resize-handle")) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      // 조명 선택
      if (onLightSelect) {
        onLightSelect(lightId);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      dragStartPosRef.current = { x: startX, y: startY };
      dragStartLightIdRef.current = lightId;
      setIsDragging(false);
      let hasMoved = false;

      const handleMouseMove = (moveEvent) => {
        if (!dragStartPosRef.current || !dragStartLightIdRef.current || !imageContainerRef.current) {
          return;
        }

        const deltaX = Math.abs(moveEvent.clientX - dragStartPosRef.current.x);
        const deltaY = Math.abs(moveEvent.clientY - dragStartPosRef.current.y);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          hasMoved = true;
          setIsDragging((prev) => {
            if (!prev) return true;
            return prev;
          });

          const bounds = getMainImageBounds();
          if (!bounds) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));
            onLightDrag(lightId, { x, y });
            return;
          }

          const containerRect = imageContainerRef.current.getBoundingClientRect();
          const relativeX = moveEvent.clientX - containerRect.left;
          const relativeY = moveEvent.clientY - containerRect.top;

          // main-image 범위 내로 제한
          const clampedX = Math.max(bounds.left, Math.min(bounds.left + bounds.width, relativeX));
          const clampedY = Math.max(bounds.top, Math.min(bounds.top + bounds.height, relativeY));

          // container 기준으로 퍼센트 계산
          const x = (clampedX / bounds.containerWidth) * 100;
          const y = (clampedY / bounds.containerHeight) * 100;

          onLightDrag(lightId, { x, y });
        }
      };

      const handleMouseUp = () => {
        // 클릭만 했고 드래그하지 않은 경우 (이미 선택은 위에서 처리됨)
        if (!hasMoved && onLightSelect) {
          onLightSelect(lightId);
        }
        setIsDragging(false);
        dragStartPosRef.current = null;
        dragStartLightIdRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: false });
      document.addEventListener("mouseup", handleMouseUp, { once: true });
    },
    [onLightDrag, onLightSelect, getMainImageBounds]
  );

  /**
   * 리사이즈 시작
   */
  const handleResizeStart = useCallback(
    (e, lightId, light, getContainerRect) => {
      e.stopPropagation();
      e.preventDefault();

      if (!light || !imageContainerRef.current) return;

      setIsResizing(true);
      dragStartLightIdRef.current = lightId;

      const rect = imageContainerRef.current.getBoundingClientRect();
      const centerX = (light.position.x / 100) * rect.width;
      const centerY = (light.position.y / 100) * rect.height;
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      const startDistance = Math.sqrt(Math.pow(startX - centerX, 2) + Math.pow(startY - centerY, 2));

      dragStartPosRef.current = { centerX, centerY, startDistance };
      resizeStartSizeRef.current = light.scale || 1.0;

      const handleMouseMove = (moveEvent) => {
        if (!dragStartPosRef.current || !imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const currentX = moveEvent.clientX - rect.left;
        const currentY = moveEvent.clientY - rect.top;
        const currentDistance = Math.sqrt(
          Math.pow(currentX - dragStartPosRef.current.centerX, 2) +
            Math.pow(currentY - dragStartPosRef.current.centerY, 2)
        );

        const scaleRatio = currentDistance / dragStartPosRef.current.startDistance;
        const newScale = Math.max(
          0.3,
          Math.min(3.0, resizeStartSizeRef.current * scaleRatio)
        );

        onLightResize(lightId, newScale);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        dragStartPosRef.current = null;
        dragStartLightIdRef.current = null;
        resizeStartSizeRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: false });
      document.addEventListener("mouseup", handleMouseUp, { once: true });
    },
    [onLightResize]
  );

  return {
    isDragging,
    isResizing,
    imageContainerRef,
    handleLightDragStart,
    handleImageDrop,
    handleImageDragOver,
    handleOverlayMouseDown,
    handleResizeStart,
  };
};

