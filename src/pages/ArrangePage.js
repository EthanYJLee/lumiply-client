import React from "react";
import LightCarousel from "../components/LightCarousel/LightCarousel";
import ImageEditor from "../components/ImageEditor/ImageEditor";
import ResultHistory from "../components/ResultHistory/ResultHistory";

/**
 * 조명 배치 화면 (/arrange)
 */
const ArrangePage = ({
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
  onImageReplace,
  onGenerate,
  processingStatus,
  isProcessing,
  onLightSelect,
  onLightDragStart,
  setSelectedLightId,
  history,
  activeHistoryId,
  onHistorySelect,
  onHistoryRemove,
  onHistoryClearAll,
  generationMessage,
  generationMessageType,
}) => {
  return (
    <div
      className="editor-container"
      onClick={(e) => {
        if (e.target.closest(".control-panel") || e.target.closest(".color-picker-dropdown")) {
          return;
        }
        if (!e.target.closest(".image-container") && !e.target.closest(".light-overlay")) {
          setSelectedLightId(null);
        }
      }}
    >
      <LightCarousel onLightSelect={onLightSelect} onLightDragStart={onLightDragStart} />

      <ImageEditor
        uploadedFile={uploadedFile}
        lights={lights}
        selectedLightId={selectedLightId}
        imageContainerRef={imageContainerRef}
        mainImageRef={mainImageRef}
        onImageDrop={onImageDrop}
        onImageDragOver={onImageDragOver}
        onImageClick={onImageClick}
        onOverlayMouseDown={onOverlayMouseDown}
        onRemoveLight={onRemoveLight}
        onResizeStart={onResizeStart}
        onImageReplace={onImageReplace}
        onGenerate={onGenerate}
        processingStatus={processingStatus}
        isProcessing={isProcessing}
        compositedPreviewUrl={null}
        resultViewSize={null}
        resultImageUrl={null}
        downloadUrl={null}
        selectedColor={null}
        onColorChange={null}
        generationMessage={generationMessage}
        generationMessageType={generationMessageType}
      />

      <div className="right-column">
        <ResultHistory
          history={history}
          activeId={activeHistoryId}
          onSelect={onHistorySelect}
          onRemove={onHistoryRemove}
          onClearAll={onHistoryClearAll}
        />
      </div>
    </div>
  );
};

export default ArrangePage;

