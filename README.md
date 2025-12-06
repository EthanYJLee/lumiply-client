## LumiPly Client (React)

방 사진에 가상 조명을 올려보고, Colab 모델이 생성한 **7가지 조명 색상 결과**를 비교·저장할 수 있는 React SPA입니다.  
어떻게 동작하는지 한 번에 이해할 수 있도록 사용 흐름과 내부 구조를 중심으로 정리했습니다.

---

### 1. 핵심 기능 요약

- **이미지 업로드**
  - 사용자가 방 사진을 업로드하면 편집 화면으로 진입합니다.
- **조명 배치 (Light placement)**
  - 이미지 위에 하나의 조명(light)을 드래그 앤 드롭으로 배치하고, 크기와 강도를 조절합니다.
  - `object-fit: contain` 을 고려해서, 편집 화면에서 보이는 위치/크기와 합성 결과가 1:1로 대응되도록 계산합니다.
- **모델 호출 & 진행률 표시**
  - “적용” 버튼을 누르면 클라이언트에서 방 + 조명이 합성된 PNG를 만들고 서버로 전송합니다.
  - 서버는 Colab을 통해 7가지 색상(white, red, orange, yellow, green, blue, purple)을 순차 생성하고, 진행률을 단계적으로 돌려줍니다.
  - 프론트에서는 원형 로더와 상태 메시지로 진행 상황을 시각화합니다.
- **결과 비교 (Before / After slider)**
  - 입력 composite 이미지와 선택한 색상의 결과 이미지를 좌우 슬라이더로 비교합니다.
  - 마우스를 올리면 중앙 바가 살짝 glow 되면서 “여기를 잡고 움직이라”는 힌트를 줍니다.
- **Color Palette**
  - 7가지 색상을 팔레트 UI로 노출하고, 선택된 색상에 따라 결과 이미지를 즉시 교체합니다.
  - 최초 1회 로딩 딜레이를 줄이기 위해, 결과 수신 시점에 각 색상 이미지를 미리 프리로드합니다.
- **History**
  - 이전에 생성한 결과들을 카드 형태로 오른쪽 컬럼에 리스트업합니다.
  - 각 히스토리는:
    - 입력 composite 썸네일,
    - 선택 색상 정보,
    - 7색 결과 URL,
    - 메시지/타임스탬프를 포함합니다.
  - `localStorage` 에 저장/복원되므로 새로고침 후에도 유지됩니다.
- **결과 저장**
  - 현재 선택된 색상의 결과 이미지를 `YYYYMMDD_HHMMSS_output_<color>.ext` 형식으로 다운로드합니다.
  - 백엔드의 `/api/download_image` 를 사용해 새 탭 전환 없이 저장합니다.

---

### 2. 화면 흐름 (UX 플로우)

1. **Upload Screen**
   - 첫 화면에서는 업로드 존만 보입니다.
   - 이미지를 드롭하거나 선택하면 “조명 배치” 화면으로 전환됩니다.
2. **Light Placement Screen**
   - 상단에 고정 헤더(로고)가 있고, 아래에 편집기가 배치됩니다.
   - 좌측: 이미지 + 조명 오버레이
   - 상단 텍스트: “조명 배치 / 조명을 자유롭게 배치해보세요.”
   - 조명은 하나만 허용하며, 두 개 이상 추가 시 경고 토스트가 뜹니다.
3. **Processing**
   - “적용” 클릭 시 전 화면에 반투명 오버레이 + 원형 로더가 표시됩니다.
   - 서버에서 전달한 `status.progress` / `message` 를 그대로 보여줍니다.
4. **Result View**
   - 이미지 영역이 “입력 vs 결과” 슬라이더로 전환됩니다.
   - 하단에는:
     - Color Palette
     - “결과 저장” 버튼(다운로드 아이콘 포함)
   - 우측 컬럼에는 Result History 카드가 계속 노출됩니다.

---

### 3. 기술 스택 및 구조

- **React + Hooks**
  - `useState`, `useEffect`, `useCallback`, `useRef` 중심으로 구성
  - 전역 상태 관리 라이브러리는 사용하지 않고, 화면 단위로 커스텀 훅을 나눴습니다.
- **주요 커스텀 훅**
  - `useImageUpload` – 업로드 상태 및 drag‑and‑drop 바인딩
  - `useLightManagement` – 조명 목록(현재는 1개), 위치/스케일/강도 관리
  - `useDragAndDrop` – 이미지 위 드롭, 조명 드래그/리사이즈 로직
  - `useImageGeneration` – 합성 + 업로드 + job polling + history/캐시
- **캔버스 합성**
  - `src/utils/canvasUtils.js`
    - `compositeImage(roomImage, lights, displaySize)`
    - `drawLightOnCanvas`  
      → **편집 화면에서 보이는 위치와 크기를, 원본 해상도 캔버스에 정확히 매핑**하는 역할을 담당합니다.
- **스타일링**
  - 전체 레이아웃/애니메이션은 `App.css` 한 곳에서 관리
  - CSS Grid / Flexbox 조합으로 화면을 2컬럼(에디터 + History) 구조로 구성

프로젝트 구조 (요약):

```bash
lumiply-client/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── components/
│   │   ├── ImageEditor/
│   │   ├── LightCarousel/
│   │   ├── ResultComparison/
│   │   ├── ResultHistory/
│   │   ├── UploadZone/
│   │   └── LightOverlay/
│   ├── hooks/
│   │   ├── useImageUpload.js
│   │   ├── useLightManagement.js
│   │   ├── useDragAndDrop.js
│   │   └── useImageGeneration.js
│   ├── utils/
│   │   └── canvasUtils.js
│   └── constants/
│       ├── defaultValues.js
│       └── colorPalette.js
└── README.md
```

---

### 4. 환경 변수

백엔드 주소를 바꾸고 싶을 때는 루트에 `.env` 파일을 만들고 다음 값을 설정합니다.

```env
REACT_APP_API_URL=http://localhost:8000
```

- 설정하지 않으면 기본값은 `http://localhost:8000` 입니다.
- 프론트에서는 `API_BASE_URL` 로 import 해서 사용합니다.

---

### 5. 실행 방법 (Development)

```bash
cd lumiply-client
npm install         # 또는 yarn
npm start           # 또는 yarn start
```

- 기본 접속 URL: `http://localhost:3000`
- FastAPI 서버는 `http://localhost:8000` 에 떠 있다고 가정합니다.
- CORS 관련 오류가 뜬다면 서버 쪽 `.env` 의 `CORS_ORIGINS` 에 `http://localhost:3000` 이 포함되어 있는지 확인합니다.

빌드:

```bash
npm run build
```

빌드 결과는 `build/` 폴더에 생성되며, 정적 호스팅에 바로 올릴 수 있습니다.

---

### 6. 프론트 ↔ 백엔드 연동 요약

- 업로드: `POST {API_BASE_URL}/api/upload`
  - body: `multipart/form-data` (`image`: canvas PNG)
  - response: `job_id`
- 상태 폴링: `GET {API_BASE_URL}/api/status/{job_id}`
  - 완료 시:
    - `result.images[color]` – 색상별 결과 URL
    - `result.input_image_url` – 입력 composite 이미지 URL
- 다운로드: `GET {API_BASE_URL}/api/download_image?path=...&filename=...`
