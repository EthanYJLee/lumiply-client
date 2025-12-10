import React from "react";
import LightCarousel from "../components/LightCarousel/LightCarousel";
import ImageEditor from "../components/ImageEditor/ImageEditor";
import ResultHistory from "../components/ResultHistory/ResultHistory";

/**
 * 조명 배치 화면 (/arrange) 의 레이아웃을 구성하는 페이지 컴포넌트입니다.
 *
 * - 좌측: 조명 목록(드래그/클릭으로 배치)
 * - 중앙: 이미지 에디터(조명 배치/적용)
 * - 우측: 생성 히스토리
 *
 * 실제 상태와 비즈니스 로직은 상위(App)에서 관리하고, 이 컴포넌트는 배치와 이벤트 위임에 집중합니다.
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
