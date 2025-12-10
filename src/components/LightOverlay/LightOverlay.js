import React from "react";

/**
 * 메인 이미지 위에 실제 조명 PNG 를 덮어씌우는 오버레이 컴포넌트입니다.
 *
 * - position(x,y)% 를 기준으로 중앙 정렬하여 배치하고
 * - intensity / colorTemperature 를 이용해 drop-shadow 효과를 만들어 간단한 광량 표현을 합니다.
 * - 선택된 상태에서는 제거 버튼과 리사이즈 핸들을 함께 노출합니다.
 */
const LightOverlay = ({
  light,
  isSelected,
  onMouseDown,
  onRemove,
  onResizeStart,
}) => {
  return (
    <div
      className={`light-overlay ${isSelected ? "selected" : ""}`}
      style={{
        left: `${light.position.x}%`,
        top: `${light.position.y}%`,
        transform: "translate(-50%, -50%)",
        filter: `drop-shadow(0 0 ${light.intensity / 2}px ${light.colorTemperature}) brightness(${
          1 + light.intensity / 200
        })`,
      }}
      onMouseDown={(e) => onMouseDown(e, light.id)}
    >
      {isSelected && (
        <>
          <button
            className="light-remove-btn"
            onClick={(e) => onRemove(e, light.id)}
            aria-label="Remove light"
          >
            ×
          </button>
          <div
            className="light-resize-handle"
            onMouseDown={(e) => onResizeStart(e, light.id)}
            aria-label="Resize light"
          />
        </>
      )}
      <img
        src={light.lightPath}
        alt="Light"
        draggable={false}
        className="light-image"
        style={{
          transform: `scale(${light.scale || 1.0})`,
        }}
      />
    </div>
  );
};

export default LightOverlay;

