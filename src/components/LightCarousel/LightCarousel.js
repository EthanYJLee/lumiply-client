import React from "react";
import { LIGHT_IMAGES } from "../../constants/lightImages";

/**
 * 조명 선택 캐러셀 컴포넌트
 */
const LightCarousel = ({ onLightSelect, onLightDragStart }) => {
  return (
    <div className="light-carousel">
      <div className="carousel-header">조명 선택</div>
      <div className="carousel-content">
        {LIGHT_IMAGES.map((lightPath, index) => (
          <div
            key={index}
            className="light-item"
            draggable
            onDragStart={(e) => onLightDragStart(e, lightPath)}
            onClick={() => onLightSelect(lightPath)}
          >
            <img
              src={lightPath}
              alt={`Light ${index + 1}`}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LightCarousel;

