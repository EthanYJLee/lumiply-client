import React, { useMemo, useState, useCallback } from "react";
import ResultCoverFlow from "../ResultCoverFlow/ResultCoverFlow";
import ResultComparison from "../ResultComparison/ResultComparison";
import { PALETTE } from "../../constants/colorPalette";
import DownloadIcon from "@mui/icons-material/Download";
import { API_BASE_URL } from "../../constants/defaultValues";

/**
 * 결과 전용 화면
 * - 좌측: 인풋(합성) 이미지
 * - 우측: 색상별 결과 이미지를 세로 coverflow 로 브라우징
 */
const ResultView = ({ previewUrl, imagesByColor, initialColorKey = "white" }) => {
  // 팔레트 정의 순서에 맞춰 항상 동일한 색상 순서를 유지
  const coverImages = useMemo(() => {
    const keys = PALETTE.map((p) => p.key);
    return keys.map((key) => ({
      id: key,
      url: imagesByColor && imagesByColor[key] ? imagesByColor[key] : null,
      label: key,
    }));
  }, [imagesByColor]);

  const [activeColor, setActiveColor] = useState(initialColorKey);
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'comparison'
  const [toastMessage, setToastMessage] = useState(null); // 슬라이더 비교용 알림

  const currentUrl = useMemo(() => {
    if (!imagesByColor) return null;
    if (imagesByColor[activeColor]) return imagesByColor[activeColor];
    const firstEntry = Object.entries(imagesByColor).find(([, url]) => !!url);
    return firstEntry ? firstEntry[1] : null;
  }, [imagesByColor, activeColor]);

  const handleSaveResult = useCallback(async () => {
    const targetUrl = currentUrl;

    if (!targetUrl) {
      alert("저장할 이미지 URL이 없습니다.");
      return;
    }

    try {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mi = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const datePart = `${yyyy}${mm}${dd}`;
      const timePart = `${hh}${mi}${ss}`;
      const colorPart = (activeColor || "white").toLowerCase();

      const urlParts = targetUrl.split("?");
      const cleanUrl = urlParts[0];
      const ext = cleanUrl.split(".").pop() || "jpg";
      const fileName = `${datePart}_${timePart}_output_${colorPart}.${ext}`;

      // CORS 우회를 위해 백엔드 프록시 엔드포인트 사용
      const downloadApiUrl = `${API_BASE_URL}/api/download_image?path=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(
        fileName
      )}`;

      const response = await fetch(downloadApiUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`이미지 다운로드 실패: ${response.status}`);
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
      alert(`이미지 저장 실패: ${e.message}`);
    }
  }, [currentUrl, activeColor]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="result-view-root">
      {viewMode === "split" ? (
        <>
          <div className="result-view-left">
            <div className="result-view-panel">
              <div className="result-view-panel-header">
                <div>
                  <div className="result-view-panel-title">입력 이미지</div>
                  <div className="result-view-panel-subtitle">조명을 합성해 업로드된 최종 입력 이미지입니다.</div>
                </div>
              </div>
              <div className="result-view-image-frame">
                <img src={previewUrl} alt="Input preview" className="result-view-image" />
              </div>
            </div>
          </div>
          <div className="result-view-right">
            <div className="result-view-panel result-view-panel-right">
              <div className="result-view-panel-header">
                <div>
                  <div className="result-view-panel-title">색상별 결과</div>
                  <div className="result-view-panel-subtitle">위/아래로 스크롤하거나 드래그하여 색상을 전환해 보세요.</div>
                </div>
                <button
                  type="button"
                  className="result-view-toggle-button"
                  onClick={() => setViewMode("comparison")}
                  disabled={!currentUrl}
                >
                  슬라이더 비교
                </button>
              </div>

              <div className="result-view-coverflow-wrapper">
                <ResultCoverFlow
                  images={coverImages}
                  activeId={activeColor}
                  onActiveChange={(id) => {
                    setActiveColor(id);
                  }}
                />
              </div>

              <div className="result-view-actions">
                <button type="button" className="result-view-save-button" onClick={handleSaveResult} disabled={!currentUrl}>
                  <DownloadIcon fontSize="small" />
                  <span>현재 색상 결과 저장</span>
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="result-view-comparison-wrapper">
          <div className="result-view-panel">
            <div className="result-view-panel-header">
              <div>
                <div className="result-view-panel-title">슬라이더 비교</div>
                <div className="result-view-panel-subtitle">입력 이미지와 선택한 색상의 결과를 슬라이더로 비교해 보세요.</div>
              </div>
              <button type="button" className="result-view-toggle-button" onClick={() => setViewMode("split")}>
                분리 보기
              </button>
            </div>
            <div className="result-view-image-frame">
              {currentUrl ? (
                <ResultComparison originalUrl={previewUrl} resultImageUrl={currentUrl} />
              ) : (
                <div className="result-comparison-loading">
                  <div className="circular-loader-lg" />
                  <div className="result-comparison-loading-text">선택한 색상의 결과를 생성하는 중입니다...</div>
                </div>
              )}
            </div>
            <div className="result-view-comparison-actions">
              <div className="color-palette">
                {PALETTE.map(({ key, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    className={`color-chip ${activeColor === key ? "color-chip-active" : ""}`}
                    onClick={() => {
                      // 아직 해당 색상의 결과 이미지가 생성되지 않았다면 클릭을 막고 토스트 표시
                      if (!imagesByColor || !imagesByColor[key]) {
                        setToastMessage(`${label}색의 결과를\n생성 중입니다.`);
                        // 2초 후 자동으로 숨김
                        setTimeout(() => {
                          setToastMessage(null);
                        }, 2000);
                        return;
                      }
                      setActiveColor(key);
                    }}
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
              <button type="button" className="result-view-save-button" onClick={handleSaveResult} disabled={!currentUrl}>
                <DownloadIcon fontSize="small" />
                <span>현재 색상 결과 저장</span>
              </button>
            </div>
          </div>
          {toastMessage && (
            <div className="result-toast result-toast-bottom-right">
              {toastMessage.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx !== toastMessage.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultView;
