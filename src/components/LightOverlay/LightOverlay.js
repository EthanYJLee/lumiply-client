import React from "react";

/**
 * 조명 오버레이 컴포넌트
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

