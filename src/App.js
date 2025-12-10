import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import "./App.css";

// Components
import UploadZone from "./components/UploadZone/UploadZone";
import Logo from "./components/Logo";

// Pages
import ArrangePage from "./pages/ArrangePage";
import ResultPage from "./pages/ResultPage";

// Hooks
import { useImageUpload } from "./hooks/useImageUpload";
import { useLightManagement } from "./hooks/useLightManagement";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useImageGeneration } from "./hooks/useImageGeneration";

function AppContent() {
  const navigate = useNavigate();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null);
  const [selectedProductData, setSelectedProductData] = useState(null);

  // 조명 관리 훅
  const {
    lights,
    selectedLightId,
    colorTemperature,
    lightIntensity,
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
    resultImagesByColor,
    generationMessage,
    generationMessageType,
    isProcessing,
    generateAndUpload,
    startJobPolling,
    resetProcessingStatus,
    history,
    clearHistory,
    removeHistoryEntry,
  } = useImageGeneration();

  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [selectedColorKey, setSelectedColorKey] = useState("white");
  const [hasNavigatedToResult, setHasNavigatedToResult] = useState(false);

  /**
   * 초기 업로드 화면 및 "이미지 재설정" 버튼에서 공통으로 사용하는 업로드 처리 핸들러입니다.
   *
   * - 업로드된 파일 상태를 갱신하고
   * - 기존 조명 및 생성 상태, 히스토리 selection 을 모두 초기화한 뒤
   * - 조명 배치 화면(/arrange) 으로 라우팅합니다.
   */
  const handleFileUpload = useCallback(
    (file) => {
      setUploadedFile(file);
      resetLights();
      resetProcessingStatus();
      setActiveHistoryId(null);
      setSelectedColorKey("white");
      setSelectedProductData(null);
      navigate("/arrange");
    },
    [resetLights, resetProcessingStatus, navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useImageUpload(uploadedFile, handleFileUpload);

  // 드래그 앤 드롭 핸들러 (조명 생성/이동/리사이즈 콜백을 useDragAndDrop 으로 전달)
  const handleLightDrop = useCallback(
    (lightPath, position) => {
      if (lights.length >= 1) {
        setGlobalAlert({ variant: "warning", message: "조명은 한 개만 배치할 수 있습니다." });
        setTimeout(() => setGlobalAlert(null), 2000);
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

  const handleLightSelect = useCallback(
    (lightId) => {
      selectLight(lightId);
    },
    [selectLight]
  );

  const mainImageRef = useRef(null);

  // useDragAndDrop 훅에서 imageContainerRef를 받아 사용 (훅 내부에서 생성됨)
  const {
    imageContainerRef,
    handleLightDragStart,
    handleImageDrop,
    handleImageDragOver,
    handleOverlayMouseDown,
    handleResizeStart: handleResizeStartBase,
  } = useDragAndDrop(handleLightDrop, handleLightDrag, handleLightResize, handleLightSelect, mainImageRef);

  const handleResizeStart = useCallback(
    (e, lightId) => {
      const light = lights.find((l) => l.id === lightId);
      if (light) {
        handleResizeStartBase(e, lightId, light, () => imageContainerRef.current?.getBoundingClientRect());
      }
    },
    [lights, handleResizeStartBase, imageContainerRef]
  );

  const handleImageClick = useCallback(
    (e) => {
      if (e.target === imageContainerRef.current || e.target.classList.contains("main-image")) {
        setSelectedLightId(null);
      }
    },
    [imageContainerRef, setSelectedLightId]
  );

  const handleRemoveLight = useCallback(
    (e, lightId) => {
      e.stopPropagation();
      removeLight(lightId);
    },
    [removeLight]
  );

  const handleResetToUpload = useCallback(() => {
    setUploadedFile(null);
    resetLights();
    resetProcessingStatus();
    setActiveHistoryId(null);
    setSelectedColorKey("white");
    setSelectedProductData(null);
    setHasNavigatedToResult(false);
    navigate("/");
  }, [resetLights, resetProcessingStatus, navigate]);

  // 조명 배치 후 적용 버튼 클릭 시
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

        const scaleToFit = Math.min(containerRect.width / naturalW, containerRect.height / naturalH);
        const drawnW = naturalW * scaleToFit;
        const drawnH = naturalH * scaleToFit;
        const imageLeft = (containerRect.width - drawnW) / 2;
        const imageTop = (containerRect.height - drawnH) / 2;

        lightsForComposite = lights.map((light) => {
          const xInContainerPx = (light.position.x / 100) * containerRect.width;
          const yInContainerPx = (light.position.y / 100) * containerRect.height;

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

      // 선택된 조명 정보를 products.json에서 가져오기
      const firstLight = lights[0];
      if (firstLight?.lightPath) {
        try {
          const productsResponse = await fetch("/products.json");
          const productsData = await productsResponse.json();
          const matchedProduct = productsData.find((p) => `/${p.file}` === firstLight.lightPath);
          if (matchedProduct) {
            setSelectedProductData(matchedProduct);
          }
        } catch (err) {
          console.error("제품 정보 로드 실패:", err);
        }
      }

      const { job_id, message } = await generateAndUpload(uploadedFile, lightsForComposite, displaySize);
      console.log(message);
      startJobPolling(job_id);
      // 결과 생성 시작과 동시에 결과 화면으로 이동
      navigate("/result", { replace: true });
      setHasNavigatedToResult(true);
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert(`이미지 생성에 실패했습니다: ${error.message}`);
    }
  }, [uploadedFile, lights, generateAndUpload, startJobPolling, mainImageRef, imageContainerRef, navigate]);

  const handleLightCarouselSelect = useCallback(
    (lightPath) => {
      if (imageContainerRef.current) {
        if (lights.length >= 1) {
          setGlobalAlert({ variant: "warning", message: "조명은 한 개만 배치할 수 있습니다." });
          setTimeout(() => setGlobalAlert(null), 2000);
          return;
        }
        addLight(lightPath, { x: 50, y: 50 });
      }
    },
    [addLight, imageContainerRef, lights]
  );

  useEffect(() => {
    if (selectedLightId) {
      const light = lights.find((l) => l.id === selectedLightId);
      if (light) {
        if (light.colorTemperature !== colorTemperature || light.intensity !== lightIntensity) {
          updateSelectedLightProperties({
            colorTemperature,
            intensity: lightIntensity,
          });
        }
      }
    }
  }, [colorTemperature, lightIntensity, selectedLightId, updateSelectedLightProperties, lights]);

  // 전역 Alert 표시
  useEffect(() => {
    if (generationMessageType === "success" && generationMessage) {
      setGlobalAlert({ variant: "success", message: generationMessage });
      setTimeout(() => setGlobalAlert(null), 2000);
    }
  }, [generationMessageType, generationMessage]);

  // 작업 완료 시 /result로 자동 이동 (replace로 히스토리 대체하여 뒤로 가기 시 /로 이동)
  useEffect(() => {
    // 부분 결과라도 첫 번째 색상(주로 white)이 도착하면 결과 화면으로 이동
    if (!hasNavigatedToResult && resultImagesByColor && Object.keys(resultImagesByColor).length > 0) {
      navigate("/result", { replace: true });
      setHasNavigatedToResult(true);
    }
  }, [hasNavigatedToResult, resultImagesByColor, navigate]);

  const activeHistoryEntry = activeHistoryId ? history.find((h) => h.id === activeHistoryId) || null : null;
  const viewingHistory = !!activeHistoryEntry;

  const effectivePreviewUrl = viewingHistory ? activeHistoryEntry?.previewUrl || null : compositedPreviewUrl;
  const historyImagesByColor = viewingHistory ? activeHistoryEntry?.imagesByColor || null : null;

  const handleHistorySelect = useCallback(
    (id) => {
      setActiveHistoryId(id);
      const entry = history.find((h) => h.id === id);
      if (entry?.colorKey) {
        setSelectedColorKey(entry.colorKey);
      }
      navigate("/result", { replace: true });
    },
    [history, navigate]
  );

  const handleHistoryRemove = useCallback(
    (id) => {
      removeHistoryEntry(id);
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
      }
    },
    [removeHistoryEntry, activeHistoryId]
  );

  const handleHistoryClearAll = useCallback(() => {
    clearHistory();
    setActiveHistoryId(null);
    setSelectedColorKey("white");
  }, [clearHistory]);

  return (
    <div className={`App ${uploadedFile ? "has-upload" : ""}`}>
      {globalAlert && (
        <div className="global-alert-container">
          <Alert variant={globalAlert.variant} className="mb-0">
            {globalAlert.message}
          </Alert>
        </div>
      )}

      <header className="app-header">
        <div className="app-header-inner">
          <button className="header-logo-button app-header-left" type="button" onClick={handleResetToUpload}>
            <Logo size="medium" variant="dark" />
          </button>
          <div className="app-header-right">
            <img src="/inisw_png_logo.png" alt="INISW Academy" className="inisw-header-logo" />
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<UploadZone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />} />
        <Route
          path="/arrange"
          element={
            uploadedFile ? (
              <ArrangePage
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
                onLightSelect={handleLightCarouselSelect}
                onLightDragStart={handleLightDragStart}
                setSelectedLightId={setSelectedLightId}
                history={history}
                activeHistoryId={activeHistoryId}
                onHistorySelect={handleHistorySelect}
                onHistoryRemove={handleHistoryRemove}
                onHistoryClearAll={handleHistoryClearAll}
                generationMessage={generationMessage}
                generationMessageType={generationMessageType}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/result"
          element={
            <ResultPage
              previewUrl={effectivePreviewUrl}
              imagesByColor={viewingHistory ? historyImagesByColor : resultImagesByColor}
              initialColorKey={selectedColorKey}
              history={history}
              activeHistoryId={activeHistoryId}
              onHistorySelect={handleHistorySelect}
              onHistoryRemove={handleHistoryRemove}
              onHistoryClearAll={handleHistoryClearAll}
              selectedProductData={selectedProductData}
            />
          }
        />
        {/* 정의되지 않은 모든 경로는 루트로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
