import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// Components
import UploadZone from "./components/UploadZone/UploadZone";
import LightCarousel from "./components/LightCarousel/LightCarousel";
import ImageEditor from "./components/ImageEditor/ImageEditor";
import ControlPanel from "./components/ControlPanel/ControlPanel";

// Hooks
import { useImageUpload } from "./hooks/useImageUpload";
import { useLightManagement } from "./hooks/useLightManagement";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useImageGeneration } from "./hooks/useImageGeneration";

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);

  // 이미지 업로드 핸들러
  const handleFileUpload = useCallback((file) => {
    setUploadedFile(file);
  }, []);

  // 이미지 업로드 훅
  const { getRootProps, getInputProps, isDragActive } = useImageUpload(uploadedFile, handleFileUpload);

  // 조명 관리 훅
  const {
    lights,
    selectedLightId,
    colorTemperature,
    lightIntensity,
    setColorTemperature,
    setLightIntensity,
    addLight,
    removeLight,
    updateLightPosition,
    updateLightScale,
    updateSelectedLightProperties,
    resetLights,
    setSelectedLightId,
    selectLight,
  } = useLightManagement();

  // 이미지 생성 훅
  const { generateAndUpload, startJobPolling, resetProcessingStatus } = useImageGeneration();

  // 드래그 앤 드롭 핸들러
  const handleLightDrop = useCallback(
    (lightPath, position) => {
      addLight(lightPath, position);
    },
    [addLight]
  );

  const handleLightDrag = useCallback(
    (lightId, position) => {
      updateLightPosition(lightId, position);
    },
    [updateLightPosition]
  );

  const handleLightResize = useCallback(
    (lightId, scale) => {
      updateLightScale(lightId, scale);
    },
    [updateLightScale]
  );

  // 조명 선택 핸들러
  const handleLightSelect = useCallback(
    (lightId) => {
      selectLight(lightId);
    },
    [selectLight]
  );

  // main-image ref
  const mainImageRef = useRef(null);

  // 드래그 앤 드롭 훅
  const {
    imageContainerRef,
    handleLightDragStart,
    handleImageDrop,
    handleImageDragOver,
    handleOverlayMouseDown,
    handleResizeStart: handleResizeStartBase,
  } = useDragAndDrop(handleLightDrop, handleLightDrag, handleLightResize, handleLightSelect, mainImageRef);

  // 리사이즈 핸들러 (light 객체 필요)
  const handleResizeStart = useCallback(
    (e, lightId) => {
      const light = lights.find((l) => l.id === lightId);
      if (light) {
        handleResizeStartBase(e, lightId, light, () => imageContainerRef.current?.getBoundingClientRect());
      }
    },
    [lights, handleResizeStartBase, imageContainerRef]
  );

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback(
    (e) => {
      if (e.target === imageContainerRef.current || e.target.classList.contains("main-image")) {
        setSelectedLightId(null);
      }
    },
    [imageContainerRef, setSelectedLightId]
  );

  // 조명 제거 핸들러
  const handleRemoveLight = useCallback(
    (e, lightId) => {
      e.stopPropagation();
      removeLight(lightId);
    },
    [removeLight]
  );

  // 리셋 핸들러
  const handleReset = useCallback(() => {
    setUploadedFile(null);
    resetLights();
    resetProcessingStatus();
  }, [resetLights, resetProcessingStatus]);

  // 이미지 생성 및 전송 핸들러
  const handleGenerate = useCallback(async () => {
    if (!uploadedFile || lights.length === 0) {
      alert("이미지와 조명을 모두 선택해주세요.");
      return;
    }

    try {
      const { job_id, message } = await generateAndUpload(uploadedFile, lights);
      alert(message || "이미지 업로드 완료. 처리 중입니다.");
      startJobPolling(job_id);
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert(`이미지 생성에 실패했습니다: ${error.message}`);
    }
  }, [uploadedFile, lights, generateAndUpload, startJobPolling]);

  // 조명 카루셀에서 조명 선택 핸들러
  const handleLightCarouselSelect = useCallback(
    (lightPath) => {
      if (imageContainerRef.current) {
        addLight(lightPath, { x: 50, y: 50 });
      }
    },
    [addLight, imageContainerRef]
  );

  // 선택된 조명의 속성 업데이트
  useEffect(() => {
    if (selectedLightId) {
      const light = lights.find((l) => l.id === selectedLightId);
      if (light) {
        // 현재 조명의 값과 다를 때만 업데이트
        if (light.colorTemperature !== colorTemperature || light.intensity !== lightIntensity) {
          updateSelectedLightProperties({
            colorTemperature,
            intensity: lightIntensity,
          });
        }
      }
    }
  }, [colorTemperature, lightIntensity, selectedLightId, updateSelectedLightProperties, lights]);

  return (
    <div className={`App ${uploadedFile ? "has-upload" : ""}`}>
      {!uploadedFile ? (
        <UploadZone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
      ) : (
        <div
          className="editor-container"
          onClick={(e) => {
            // ControlPanel이나 색상 팔레트를 클릭한 경우 선택 유지
            if (e.target.closest(".control-panel") || e.target.closest(".color-picker-dropdown")) {
              return;
            }
            if (!e.target.closest(".image-container") && !e.target.closest(".light-overlay")) {
              setSelectedLightId(null);
            }
          }}
        >
          <LightCarousel onLightSelect={handleLightCarouselSelect} onLightDragStart={handleLightDragStart} />

          <ImageEditor
            uploadedFile={uploadedFile}
            lights={lights}
            selectedLightId={selectedLightId}
            imageContainerRef={imageContainerRef}
            mainImageRef={mainImageRef}
            onImageDrop={handleImageDrop}
            onImageDragOver={handleImageDragOver}
            onImageClick={handleImageClick}
            onOverlayMouseDown={handleOverlayMouseDown}
            onRemoveLight={handleRemoveLight}
            onResizeStart={handleResizeStart}
            onReset={handleReset}
            onGenerate={handleGenerate}
          />

          <ControlPanel
            selectedLightId={selectedLightId}
            colorTemperature={colorTemperature}
            lightIntensity={lightIntensity}
            onColorTemperatureChange={setColorTemperature}
            onLightIntensityChange={setLightIntensity}
          />
        </div>
      )}
    </div>
  );
}

export default App;
