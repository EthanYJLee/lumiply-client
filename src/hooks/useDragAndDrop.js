import { useRef, useState, useCallback } from "react";
import { DRAG_THRESHOLD } from "../constants/defaultValues";

/**
 * 조명 아이콘을 캔버스 위로 드래그/드롭하고, 배치된 조명을 마우스로 이동·리사이즈할 때 필요한
 * 상태와 이벤트 핸들러를 모두 캡슐화한 훅입니다.
 *
 * @param {Function} onLightDrop   - 새 조명을 이미지 위에 드롭했을 때 호출 (lightPath, {x,y}%)
 * @param {Function} onLightDrag   - 배치된 조명을 드래그로 이동할 때 호출 (lightId, {x,y}%)
 * @param {Function} onLightResize - 리사이즈 핸들에서 드래그할 때 호출 (lightId, scale)
 * @param {Function} onLightSelect - 조명을 클릭/드래그 시작할 때 선택 처리 콜백 (lightId)
 * @param {Object} mainImageRef    - 실제 방 이미지를 가리키는 ref (object-fit: contain 상태에서 bounds 계산용)
 * @returns {{
 *   isDragging: boolean,
 *   isResizing: boolean,
 *   imageContainerRef: React.RefObject<HTMLElement>,
 *   handleLightDragStart: (e: DragEvent, lightPath: string) => void,
 *   handleImageDrop: (e: DragEvent) => void,
 *   handleImageDragOver: (e: DragEvent) => void,
 *   handleOverlayMouseDown: (e: MouseEvent, lightId: number) => void,
 *   handleResizeStart: (e: MouseEvent, lightId: number, light: Object, getContainerRect: Function) => void,
 * }} 드래그 관련 refs 및 핸들러
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
   * 좌측 조명 리스트에서 이미지를 끌어오기 시작할 때 호출됩니다.
   * - 브라우저 기본 drag 이미지는 사용하지 않고, lightPath 만 ref 에 기록합니다.
   */
  const handleLightDragStart = useCallback((e, lightPath) => {
    e.preventDefault();
    draggedLightRef.current = lightPath;
  }, []);

  /**
   * 현재 이미지 컨테이너 내에서 main-image 가 차지하는 실제 픽셀 영역을 계산합니다.
   * - object-fit: contain 으로 그려지는 특성을 고려해, 컨테이너 기준 offset/width/height 를 반환합니다.
   * - 이미지가 아직 로드되지 않은 경우 null 을 반환합니다.
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
   * 드롭 존 위에 드래그하던 조명을 떨어뜨렸을 때 호출됩니다.
   *
   * - main-image bounds 가 계산 가능한 경우, 조명이 실제 이미지 내부에서만 떨어지도록 좌표를 클램핑합니다.
   * - bounds 를 얻지 못하면 컨테이너 전체를 기준으로 퍼센트 좌표를 계산합니다.
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
   * 브라우저 기본 드롭 동작을 막기 위한 drag over 핸들러입니다.
   */
  const handleImageDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  /**
   * 배치된 조명 오버레이를 마우스로 누를 때 호출됩니다.
   *
   * - 제거 버튼/리사이즈 핸들을 클릭한 경우에는 드래그를 시작하지 않습니다.
   * - 일정 threshold 이상 움직였을 때만 실제 드래그로 간주하고 onLightDrag 를 호출합니다.
   * - 클릭만 하고 떼면 onLightSelect 로 선택만 처리합니다.
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
   * 선택된 조명의 리사이즈 핸들을 드래그하기 시작했을 때 호출됩니다.
   *
   * - 조명 중심과 마우스 위치 사이의 거리 비율을 기준으로 scale 을 계산합니다.
   * - 너무 작거나 큰 값은 0.3 ~ 3.0 범위로 제한합니다.
   * - 리사이즈 중에는 isResizing 플래그가 true 로 유지됩니다.
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

