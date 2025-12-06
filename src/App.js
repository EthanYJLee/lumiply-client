import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-bootstrap";
import "./App.css";

// Components
import UploadZone from "./components/UploadZone/UploadZone";
import LightCarousel from "./components/LightCarousel/LightCarousel";
import ImageEditor from "./components/ImageEditor/ImageEditor";
// import ControlPanel from "./components/ControlPanel/ControlPanel";
import ResultHistory from "./components/ResultHistory/ResultHistory";
import Logo from "./components/Logo";

// Hooks
import { useImageUpload } from "./hooks/useImageUpload";
import { useLightManagement } from "./hooks/useLightManagement";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useImageGeneration } from "./hooks/useImageGeneration";

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null); // { variant, message }

  // 조명 관리 훅
  const {
    lights,
    selectedLightId,
    colorTemperature,
    lightIntensity,
    // setColorTemperature,
    // setLightIntensity,
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
  const {
    processingStatus,
    compositedPreviewUrl,
    generatedViewSize,
    resultImageUrl,
    resultImagesByColor,
    generationMessage,
    generationMessageType,
    isProcessing,
    generateAndUpload,
    startJobPolling,
    resetProcessingStatus,
    history,
    setActiveResultColor,
    clearHistory,
    removeHistoryEntry,
  } = useImageGeneration();

  // 이미지 업로드 핸들러 (업로드 또는 교체 시 공통 사용)
  const handleFileUpload = useCallback(
    (file) => {
      setUploadedFile(file);
      resetLights();
      resetProcessingStatus();
      // 새 세션 시작 시에는 현재 화면을 히스토리와 분리
      setActiveHistoryId(null);
      setSelectedColorKey("white");
    },
    [resetLights, resetProcessingStatus]
  );

  // 이미지 업로드 훅
  const { getRootProps, getInputProps, isDragActive } = useImageUpload(uploadedFile, handleFileUpload);

  // 드래그 앤 드롭 핸들러
  const handleLightDrop = useCallback(
    (lightPath, position) => {
      if (lights.length >= 1) {
        setGlobalAlert({ variant: "warning", message: "조명은 한 개만 배치할 수 있습니다." });
        return;
      }
      addLight(lightPath, position);
    },
    [addLight, lights]
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

  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [selectedColorKey, setSelectedColorKey] = useState("white");

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

  // 초기 화면으로 돌아가는 핸들러 (헤더 로고 클릭 시)
  const handleResetToUpload = useCallback(() => {
    setUploadedFile(null);
    resetLights();
    resetProcessingStatus();
    setActiveHistoryId(null);
    setSelectedColorKey("white");
  }, [resetLights, resetProcessingStatus]);

  // 이미지 생성 및 전송 핸들러
  const handleGenerate = useCallback(async () => {
    if (!uploadedFile || lights.length === 0) {
      alert("이미지와 조명을 모두 선택해주세요.");
      return;
    }

    try {
      const containerRect = imageContainerRef.current?.getBoundingClientRect();
      const imageEl = mainImageRef.current;

      let lightsForComposite = lights;
      let displaySize;

      if (containerRect && imageEl && imageEl.naturalWidth && imageEl.naturalHeight) {
        const naturalW = imageEl.naturalWidth;
        const naturalH = imageEl.naturalHeight;

        // object-fit: contain 에서 실제 그려지는 이미지 크기와 위치를 직접 계산
        const scaleToFit = Math.min(containerRect.width / naturalW, containerRect.height / naturalH);
        const drawnW = naturalW * scaleToFit;
        const drawnH = naturalH * scaleToFit;
        const imageLeft = (containerRect.width - drawnW) / 2;
        const imageTop = (containerRect.height - drawnH) / 2;

        lightsForComposite = lights.map((light) => {
          // 현재 light.position 은 컨테이너 기준 퍼센트 값 (센터 좌표)
          const xInContainerPx = (light.position.x / 100) * containerRect.width;
          const yInContainerPx = (light.position.y / 100) * containerRect.height;

          // 이미지 영역 내부 좌표(px)로 변환
          const xInImagePx = xInContainerPx - imageLeft;
          const yInImagePx = yInContainerPx - imageTop;

          const xImagePercent = (xInImagePx / drawnW) * 100;
          const yImagePercent = (yInImagePx / drawnH) * 100;

          return {
            ...light,
            position: {
              x: xImagePercent,
              y: yImagePercent,
            },
          };
        });

        displaySize = { width: Math.round(drawnW), height: Math.round(drawnH) };
      } else {
        displaySize = undefined;
      }

      const { job_id, message } = await generateAndUpload(uploadedFile, lightsForComposite, displaySize);
      // alert(message || "이미지 업로드 완료. 처리 중입니다.");
      console.log(message);
      startJobPolling(job_id);
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert(`이미지 생성에 실패했습니다: ${error.message}`);
    }
  }, [uploadedFile, lights, generateAndUpload, startJobPolling, mainImageRef, imageContainerRef]);

  // 조명 캐러셀에서 조명 선택 핸들러
  const handleLightCarouselSelect = useCallback(
    (lightPath) => {
      if (imageContainerRef.current) {
        if (lights.length >= 1) {
          setGlobalAlert({ variant: "warning", message: "조명은 한 개만 배치할 수 있습니다." });
          const timer = setTimeout(() => setGlobalAlert(null), 2000);
          return () => clearTimeout(timer);
        }
        addLight(lightPath, { x: 50, y: 50 });
      }
    },
    [addLight, imageContainerRef, lights]
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

  // 전역 Alert 표시 (2초 뒤 자동 닫힘)
  useEffect(() => {
    if (generationMessageType === "success" && generationMessage) {
      setGlobalAlert({ variant: "success", message: generationMessage });
      const timer = setTimeout(() => setGlobalAlert(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [generationMessageType, generationMessage]);

  const activeHistoryEntry = activeHistoryId ? history.find((h) => h.id === activeHistoryId) || null : null;
  const viewingHistory = !!activeHistoryEntry;

  // 프리뷰는
  // - 히스토리 모드: 해당 항목의 previewUrl (인풋 합성 이미지)만 사용
  // - 일반 모드: 현재 세션의 compositedPreviewUrl
  const effectivePreviewUrl = viewingHistory ? activeHistoryEntry?.previewUrl || null : compositedPreviewUrl;

  // 현재 세션에서 선택된 색상의 URL (multi-color 지원용)
  const currentColorUrl = !viewingHistory && resultImagesByColor && selectedColorKey ? resultImagesByColor[selectedColorKey] || null : null;

  // 히스토리 모드에서 사용할 색상별 이미지 맵 (없으면 null)
  const historyImagesByColor = viewingHistory ? activeHistoryEntry?.imagesByColor || null : null;

  // 결과 이미지는
  // - 히스토리 항목을 보는 경우:
  //     해당 히스토리의 imagesByColor[selectedColorKey] → colorKey 기본값 → resultUrl
  // - 아니면: (현재 세션 색상별 URL) → (현재 세션 resultImageUrl)
  const effectiveResultUrl = viewingHistory
    ? (historyImagesByColor && selectedColorKey && historyImagesByColor[selectedColorKey]) ||
      (historyImagesByColor && activeHistoryEntry?.colorKey && historyImagesByColor[activeHistoryEntry.colorKey]) ||
      activeHistoryEntry?.resultUrl ||
      null
    : currentColorUrl || resultImageUrl;

  const effectiveViewSize = viewingHistory ? activeHistoryEntry?.viewSize || generatedViewSize : generatedViewSize;

  return (
    <div className={`App ${uploadedFile ? "has-upload" : ""}`}>
      {globalAlert && (
        <div className="global-alert-container">
          <Alert variant={globalAlert.variant} className="mb-0">
            {globalAlert.message}
          </Alert>
        </div>
      )}

      {uploadedFile && (
        <header className="app-header">
          <div className="app-header-inner">
            <button className="header-logo-button app-header-left" type="button" onClick={handleResetToUpload}>
              <Logo size="medium" variant="dark" />
            </button>
            {/* <div className="app-header-right">
              <img src="/inisw.png" alt="INISW Academy" className="inisw-header-logo" />
            </div> */}
          </div>
        </header>
      )}
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
            onImageReplace={handleFileUpload}
            onGenerate={handleGenerate}
            processingStatus={processingStatus}
            isProcessing={isProcessing}
            compositedPreviewUrl={effectivePreviewUrl}
            resultViewSize={effectiveViewSize}
            resultImageUrl={effectiveResultUrl}
            downloadUrl={currentColorUrl || effectiveResultUrl}
            selectedColor={selectedColorKey}
            onColorChange={(colorKey) => {
              setSelectedColorKey(colorKey);
              if (!viewingHistory) {
                setActiveResultColor(colorKey);
              }
            }}
            generationMessage={generationMessage}
            generationMessageType={generationMessageType}
          />

          <div className="right-column">
            {/* <ControlPanel
              selectedLightId={selectedLightId}
              colorTemperature={colorTemperature}
              lightIntensity={lightIntensity}
              onColorTemperatureChange={setColorTemperature}
              onLightIntensityChange={setLightIntensity}
            /> */}
            <ResultHistory
              history={history}
              activeId={activeHistoryId}
              onSelect={(id) => {
                setActiveHistoryId(id);
                const entry = history.find((h) => h.id === id);
                if (entry?.colorKey) {
                  setSelectedColorKey(entry.colorKey);
                }
              }}
              onRemove={(id) => {
                removeHistoryEntry(id);
                if (activeHistoryId === id) {
                  setActiveHistoryId(null);
                }
              }}
              onClearAll={() => {
                clearHistory();
                setActiveHistoryId(null);
                setSelectedColorKey("white");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
