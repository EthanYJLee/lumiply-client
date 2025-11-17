import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

// 조명 이미지 경로 (public/lights 폴더의 png 파일들을 동적으로 생성)
const LIGHT_IMAGES = Array.from({ length: 105 }, (_, i) => `/lights/${i}.png`);

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [lights, setLights] = useState([]);
  const [selectedLightId, setSelectedLightId] = useState(null);
  const [colorTemperature, setColorTemperature] = useState("#ffffff");
  const [lightIntensity, setLightIntensity] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef(null);
  const dragStartLightIdRef = useRef(null);
  const imageContainerRef = useRef(null);
  const draggedLightRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      console.log("Uploaded file:", file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
    },
    multiple: false,
    noClick: !!uploadedFile, // 이미지가 업로드되면 클릭 비활성화
  });

  const handleLightDragStart = (e, lightPath) => {
    e.preventDefault();
    draggedLightRef.current = lightPath;
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    if (draggedLightRef.current && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newLight = {
        id: Date.now() + Math.random(),
        lightPath: draggedLightRef.current,
        position: { x, y },
        colorTemperature: "#ffffff",
        intensity: 50,
      };

      setLights([...lights, newLight]);
      setSelectedLightId(newLight.id);
      setColorTemperature(newLight.colorTemperature);
      setLightIntensity(newLight.intensity);
    }
    draggedLightRef.current = null;
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageClick = (e) => {
    // 드래그 중이면 클릭 이벤트 무시
    if (isDragging) {
      return;
    }
    // 조명 오버레이를 클릭한 경우 무시
    if (e.target.closest(".light-overlay")) {
      return;
    }
    // 선택 해제
    setSelectedLightId(null);
  };

  const handleOverlayMouseDown = (e, lightId) => {
    // 제거 버튼을 클릭한 경우 드래그 시작하지 않음
    if (e.target.closest(".light-remove-btn")) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    dragStartPosRef.current = { x: startX, y: startY };
    dragStartLightIdRef.current = lightId;
    setIsDragging(false);

    setSelectedLightId(lightId);
    const light = lights.find((l) => l.id === lightId);
    if (light) {
      setColorTemperature(light.colorTemperature);
      setLightIntensity(light.intensity);
    }

    // 드래그 이벤트 리스너 등록
    const handleMouseMove = (moveEvent) => {
      if (!dragStartPosRef.current || !dragStartLightIdRef.current || !imageContainerRef.current) return;

      const deltaX = Math.abs(moveEvent.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(moveEvent.clientY - dragStartPosRef.current.y);
      const dragThreshold = 5; // 5px 이상 이동해야 드래그로 인식

      // 드래그 임계값을 넘으면 드래그 시작
      setIsDragging((prev) => {
        if (!prev && (deltaX > dragThreshold || deltaY > dragThreshold)) {
          return true;
        }
        return prev;
      });

      // 드래그 중일 때만 위치 업데이트
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));

        setLights((prevLights) =>
          prevLights.map((light) => (light.id === dragStartLightIdRef.current ? { ...light, position: { x, y } } : light))
        );
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartPosRef.current = null;
      dragStartLightIdRef.current = null;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleRemoveLight = (e, lightId) => {
    e.stopPropagation();
    setLights(lights.filter((l) => l.id !== lightId));
    if (selectedLightId === lightId) {
      setSelectedLightId(null);
    }
  };

  const handleGenerate = () => {
    if (!uploadedFile || lights.length === 0) {
      alert("이미지와 조명을 모두 선택해주세요.");
      return;
    }
    console.log("Generate clicked:", {
      image: uploadedFile.name,
      lights: lights,
    });
    // 여기에 조명 합성 로직을 추가하세요
  };

  // 선택된 조명의 속성 업데이트
  useEffect(() => {
    if (selectedLightId) {
      setLights((prevLights) =>
        prevLights.map((light) => (light.id === selectedLightId ? { ...light, colorTemperature, intensity: lightIntensity } : light))
      );
    }
  }, [colorTemperature, lightIntensity, selectedLightId]);

  return (
    <div className={`App ${uploadedFile ? "has-upload" : ""}`}>
      {!uploadedFile ? (
        <div className="upload-container">
          <div {...getRootProps()} className={`upload-zone ${isDragActive ? "drag-active" : ""}`}>
            <input {...getInputProps()} />
            <div className="upload-content">
              <div className="upload-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15V3M12 3L8 7M12 3L16 7M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {isDragActive ? (
                <p className="upload-text">이미지를 여기에 놓으세요</p>
              ) : (
                <>
                  <p className="upload-text">
                    <span className="upload-highlight">이미지를 클릭</span>하거나
                    <br />
                    여기로 드래그하세요
                  </p>
                  <p className="upload-hint">PNG, JPG 지원</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="editor-container">
          {/* 좌측: 조명 이미지 Carousel */}
          <div className="light-carousel">
            <div className="carousel-header">조명 선택</div>
            <div className="carousel-content">
              {LIGHT_IMAGES.map((lightPath, index) => (
                <div
                  key={index}
                  className="light-item"
                  draggable
                  onDragStart={(e) => handleLightDragStart(e, lightPath)}
                  onClick={() => {
                    // 조명을 클릭하면 이미지 중앙에 추가
                    if (imageContainerRef.current) {
                      const newLight = {
                        id: Date.now() + Math.random(),
                        lightPath: lightPath,
                        position: { x: 50, y: 50 },
                        colorTemperature: "#ffffff",
                        intensity: 50,
                      };
                      setLights([...lights, newLight]);
                      setSelectedLightId(newLight.id);
                      setColorTemperature(newLight.colorTemperature);
                      setLightIntensity(newLight.intensity);
                    }
                  }}
                >
                  <img src={lightPath} alt={`Light ${index + 1}`} onError={(e) => (e.target.style.display = "none")} />
                </div>
              ))}
            </div>
          </div>

          {/* 중앙: 업로드된 이미지 */}
          <div className="image-editor">
            <div
              ref={imageContainerRef}
              className="image-container"
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
              onClick={handleImageClick}
            >
              <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" className="main-image" />
              {lights.map((light) => (
                <div
                  key={light.id}
                  className={`light-overlay ${selectedLightId === light.id ? "selected" : ""}`}
                  style={{
                    left: `${light.position.x}%`,
                    top: `${light.position.y}%`,
                    transform: "translate(-50%, -50%)",
                    filter: `drop-shadow(0 0 ${light.intensity / 2}px ${light.colorTemperature}) brightness(${1 + light.intensity / 200})`,
                  }}
                  onMouseDown={(e) => handleOverlayMouseDown(e, light.id)}
                >
                  <button className="light-remove-btn" onClick={(e) => handleRemoveLight(e, light.id)} aria-label="Remove light">
                    ×
                  </button>
                  <img src={light.lightPath} alt="Light" className="light-image" />
                </div>
              ))}
            </div>
            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>

          {/* 우측: 컨트롤 패널 */}
          <div className="control-panel">
            {selectedLightId ? (
              <>
                {/* 색온도 팔레트 */}
                <div className="control-section">
                  <div className="control-label">색온도</div>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={colorTemperature}
                      onChange={(e) => setColorTemperature(e.target.value)}
                      className="color-picker"
                    />
                    <div className="color-preview" style={{ backgroundColor: colorTemperature }}></div>
                  </div>
                </div>

                {/* 광량 조절 */}
                <div className="control-section">
                  <div className="control-label">광량: {lightIntensity}%</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                    className="intensity-slider"
                  />
                </div>
              </>
            ) : (
              <div className="control-placeholder">
                <p>조명을 선택하거나 추가하세요</p>
                <p className="control-hint">좌측에서 조명을 클릭하거나 드래그하여 추가할 수 있습니다</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
