import React, { useMemo, useCallback, useRef } from "react";
import LightOverlay from "../LightOverlay/LightOverlay";
import ResultComparison from "../ResultComparison/ResultComparison";
import { PALETTE } from "../../constants/colorPalette";
import DownloadIcon from "@mui/icons-material/Download";
import { API_BASE_URL } from "../../constants/defaultValues";

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
  onImageReplace,
  onGenerate,
  processingStatus,
  isProcessing,
  compositedPreviewUrl,
  resultViewSize,
  resultImageUrl,
  downloadUrl,
  selectedColor,
  onColorChange,
  generationMessage,
  generationMessageType,
}) => {
  const hasResult = !!resultImageUrl;
  const fileInputRef = useRef(null);

  const statusLabel = useMemo(() => {
    if (processingStatus) {
      const progress = processingStatus.progress ?? 0;
      return `${processingStatus.message || "처리 중입니다."} (${progress}%)`;
    }
    if (generationMessage) {
      return generationMessage;
    }
    return null;
  }, [processingStatus, generationMessage]);

  const headerTitle = hasResult ? "결과 보기" : "조명 배치";
  const headerSubtitle = hasResult ? "슬라이더를 좌우로 움직이며 Before / After를 비교해 보세요." : "조명을 자유롭게 배치해보세요.";

  const handleSaveResult = useCallback(async () => {
    const targetUrl = downloadUrl || resultImageUrl;
    if (!targetUrl) return;

    try {
      // 파일명: YYYYMMDD_HHMMSS_output_색상.ext
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mi = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const datePart = `${yyyy}${mm}${dd}`;
      const timePart = `${hh}${mi}${ss}`;
      const colorPart = (selectedColor || "white").toLowerCase();

      const urlParts = targetUrl.split("?");
      const cleanUrl = urlParts[0];
      const ext = cleanUrl.split(".").pop() || "png";
      const fileName = `${datePart}_${timePart}_output_${colorPart}.${ext}`;

      // 백엔드 다운로드 엔드포인트로부터 Blob을 받아와서, 새 탭 이동 없이 저장
      const downloadUrlApi = `${API_BASE_URL}/api/download_image?path=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(
        fileName
      )}`;

      const response = await fetch(downloadUrlApi, { method: "GET" });
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error("결과 이미지 저장 중 오류:", e);
    }
  }, [downloadUrl, resultImageUrl, selectedColor]);

  const handleResetClick = useCallback(() => {
    if (isProcessing) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, [isProcessing]);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (file && onImageReplace) {
        onImageReplace(file);
      }
    },
    [onImageReplace]
  );

  return (
    <div className="image-editor">
      <div className="comparison-header">
        <div>
          <div className="comparison-title">{headerTitle}</div>
          <div className="comparison-subtitle">{headerSubtitle}</div>
        </div>
        <button type="button" className="header-reset-button" onClick={handleResetClick} disabled={isProcessing}>
          이미지 재설정
        </button>
      </div>

      {/* 결과 화면에서만 색상 팔레트 표시 */}
      {/* {hasResult && (
        <div className="color-palette">
          {PALETTE.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              className={`color-chip ${selectedColor === key ? "color-chip-active" : ""}`}
              onClick={() => setSelectedColor(key)}
            >
              <span
                className="color-chip-swatch"
                style={{
                  background: `radial-gradient(circle at 30% 20%, #fff, ${color})`,
                }}
              />
              <span className="color-chip-label">{label}</span>
            </button>
          ))}
        </div>
      )} */}

      <div
        ref={imageContainerRef}
        className="image-container"
        onDrop={hasResult ? undefined : onImageDrop}
        onDragOver={hasResult ? undefined : onImageDragOver}
        onClick={hasResult ? undefined : onImageClick}
      >
        {hasResult ? (
          <ResultComparison originalUrl={compositedPreviewUrl} resultImageUrl={resultImageUrl} />
        ) : (
          <>
            <img ref={mainImageRef} src={URL.createObjectURL(uploadedFile)} alt="Uploaded" className="main-image" />
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
          </>
        )}
      </div>

      {/* 숨겨진 파일 입력 (이미지 재설정용) */}
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

      <div className="button-group">
        {hasResult && (
          <div className="color-palette">
            {PALETTE.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                className={`color-chip ${selectedColor === key ? "color-chip-active" : ""}`}
                onClick={() => onColorChange && onColorChange(key)}
              >
                <span
                  className="color-chip-swatch"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, #fff, ${color})`,
                  }}
                />
                <span className="color-chip-label">{label}</span>
              </button>
            ))}
          </div>
        )}
        <button className="generate-button" onClick={hasResult ? handleSaveResult : onGenerate} disabled={isProcessing && !hasResult}>
          {hasResult ? (
            <>
              <DownloadIcon></DownloadIcon>
              결과 저장
            </>
          ) : isProcessing ? (
            "처리 중..."
          ) : (
            "적용"
          )}
        </button>
      </div>

      {isProcessing && (
        <div className="editor-processing-overlay">
          <div className="editor-processing-dialog">
            <div className="circular-loader-lg" />
            {statusLabel && <div className="editor-processing-text">{statusLabel}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
