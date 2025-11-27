import React, { useRef } from "react";
import LightOverlay from "../LightOverlay/LightOverlay";

/**
 * 이미지 에디터 컴포넌트
 */
const ImageEditor = ({
  uploadedFile,
  lights,
  selectedLightId,
  imageContainerRef,
  mainImageRef,
  onImageDrop,
  onImageDragOver,
  onImageClick,
  onOverlayMouseDown,
  onRemoveLight,
  onResizeStart,
  onReset,
  onGenerate,
}) => {
  return (
    <div className="image-editor">
      <div
        ref={imageContainerRef}
        className="image-container"
        onDrop={onImageDrop}
        onDragOver={onImageDragOver}
        onClick={onImageClick}
      >
        <img
          ref={mainImageRef}
          src={URL.createObjectURL(uploadedFile)}
          alt="Uploaded"
          className="main-image"
        />
        {lights.map((light) => (
          <LightOverlay
            key={light.id}
            light={light}
            isSelected={selectedLightId === light.id}
            onMouseDown={onOverlayMouseDown}
            onRemove={onRemoveLight}
            onResizeStart={onResizeStart}
          />
        ))}
      </div>
      <div className="button-group">
        <button className="reset-button" onClick={onReset}>
          이미지 재설정
        </button>
        <button className="generate-button" onClick={onGenerate}>
          적용
        </button>
      </div>
    </div>
  );
};

export default ImageEditor;

