## Lumiply Client (React)

![cover](public/lumiply_client_cover.png)

Lumiply 프로젝트의 **프론트엔드(SPA)** 저장소입니다.  
사용자는 방 사진을 업로드하고, 가상 조명을 배치한 뒤, Colab에서 돌아가는 LumiNet 모델이 생성한 **7가지 조명 색상 결과**를 비교·저장할 수 있습니다.

백엔드/Colab까지 포함한 전체 구조에서 보면:

- `lumiply-client` (현재 레포지토리):  
  방 사진 업로드, 조명 배치, 결과 비교 및 히스토리 관리 UI
- `lumiply-server` (FastAPI):  
  클라이언트에서 합성한 이미지를 받아 Colab으로 전달하고, 색상별 결과/진행률을 취합
- `lumiply-colab` (Colab + Flask + LumiNet):  
  LumiNet 기반 조명 생성 모델을 실제로 실행하고 `/process` 로 결과를 반환

---

### 1. 핵심 기능 한눈에 보기

- **이미지 업로드**
  - 방 사진을 드래그 앤 드롭 또는 파일 선택으로 업로드하면, 즉시 편집 화면으로 진입합니다.
- **조명 배치 (Light placement)**
  - 이미지 위에 **하나의 조명(light)** 을 드래그 앤 드롭으로 배치합니다.
  - 위치, 크기(스케일), 강도(투명도 등)를 조절할 수 있습니다.
  - 렌더링에는 `object-fit: contain` 을 사용하고, 이 비율을 고려해 **편집 화면에서 보이는 위치/크기와 최종 합성 결과가 1:1로 대응되도록** 좌표를 변환합니다.
  - 두 개 이상 조명을 추가하려고 하면, 토스트 경고를 띄우고 제한합니다.
- **모델 호출 & 진행률 표시**
  - “적용” 버튼을 누르면:
    - 캔버스에서 **방 + 조명**이 합성된 PNG를 생성하고,
    - 이를 FastAPI 서버로 업로드합니다.
  - 서버는 Colab을 통해 7가지 색상(white, red, orange, yellow, green, blue, purple)을 순차 생성합니다.
  - 프론트에서는 `status.progress` / `message` 값을 이용해 **원형 로더 + 텍스트**로 처리 단계를 보여줍니다.
- **결과 비교 (Before / After slider)**
  - 입력 composite 이미지와 선택한 색상의 결과 이미지를 **슬라이더로 좌우 비교**합니다.
  - 마우스를 중앙 바에 올리면 살짝 glow 효과를 주어 “여기를 드래그하세요”라는 시각적 힌트를 제공합니다.
- **Color Palette**
  - 7가지 색상을 팔레트 UI로 제공하고, 선택한 색상에 따라 결과 이미지를 즉시 교체합니다.
  - 최초 딜레이를 줄이기 위해, 7개 색상 이미지 URL을 받는 순간 모두 프리로드해 둡니다.
- **Result History**
  - 이전에 생성한 결과들을 오른쪽 컬럼에 카드 형태로 나열합니다.
  - 각 히스토리는:
    - 입력 composite 썸네일
    - 사용자가 마지막으로 선택한 색상 정보
    - 7가지 색상 결과 이미지 URL
    - 생성 시점 등 메타 정보
      를 포함합니다.
  - 메모리 상태 + `localStorage` 를 함께 사용해, **새로고침/브라우저 재시작 후에도 히스토리가 유지**되도록 했습니다.
  - 개별 히스토리 삭제 / 전체 삭제 버튼도 제공합니다.
- **결과 저장**
  - 현재 선택된 색상의 결과 이미지를
    - `YYYYMMDD_HHMMSS_output_<color>.ext` 형식의 파일 이름으로,
    - 새 탭 없이 바로 다운로드할 수 있습니다.
  - 백엔드의 `/api/download_image` 엔드포인트를 통해 브라우저 기본 다운로드 동작을 활용합니다.

---

### 2. 화면 흐름 (UX 플로우)

#### 2‑1. Upload Screen

- 첫 화면에서는 업로드 존만 보이도록 최소한의 요소만 배치했습니다.
- 사용자는 방 사진을 드롭하거나 선택하면, 자동으로 “조명 배치” 화면으로 전환됩니다.
- 이 단계에서는 아직 서버/Colab과 통신하지 않습니다. 클라이언트 로컬 상태만 사용합니다.

#### 2‑2. Light Placement Screen

- 상단에 고정 헤더(로고, 리셋 버튼 등)가 있고, 그 아래에 이미지 편집기가 위치합니다.
- 좌측 주요 영역:
  - 업로드한 방 사진 위에 조명(light) 오버레이를 표시합니다.
  - 조명은 드래그, 리사이즈, 회전(필요 시) 등이 가능하도록 구현되어 있습니다.
- 우측 컬럼:
  - 현재 세션/과거 세션에서 생성한 결과들을 보여주는 **Result History 카드**가 항상 노출됩니다.
- 조명은 **동시에 하나만 허용**하며, 추가 시도 시 경고 토스트를 띄우고 무시합니다.
- “이미지 리셋”은 헤더에 배치하여, 사용자가 편집 도중에도 쉽게 초기 상태로 되돌릴 수 있습니다.

#### 2‑3. Processing 상태

- 사용자가 “적용” 버튼을 누르면:
  - “적용” 버튼은 비활성화되고,
  - 전체 화면에 반투명 오버레이 + 원형 로더가 표시됩니다.
- 서버로부터 내려오는 진행률에 맞춰:
  - 0–10%: 이미지 전송 단계
  - 이후 10% 단위로 각 색상(white → red → …) 생성 상태를 메시지와 함께 노출합니다.
- 이 단계는 UX 관점에서 “심리적 대기 시간”을 줄이기 위해 세분화되어 있습니다.

#### 2‑4. Result View

- 처리 완료 후, 메인 이미지 영역이 **비교 모드 슬라이더**로 전환됩니다.
  - 왼쪽: 입력 composite (off + 조명)
  - 오른쪽: 선택된 색상의 결과 이미지
- 하단에는:
  - Color Palette (7색)
  - “결과 저장” 버튼(머티리얼 디자인 계열 save 아이콘 포함)
    가 배치되어 있습니다.
- 우측 Result History 카드에서는:
  - 특정 히스토리를 선택하면, 해당 시점의 **입력 이미지 + 7가지 결과 이미지**를 다시 로드하여 동일한 비교 화면으로 복원합니다.

---

### 3. 기술 스택 및 구조

- **기본 스택**
  - React (CRA 기반 SPA)
  - React Hooks (`useState`, `useEffect`, `useCallback`, `useRef` 등)
  - 순수 CSS (`App.css`) + CSS Grid/Flexbox 레이아웃
- **상태 관리**
  - 별도 상태 관리 라이브러리(Redux 등)는 두지 않고,
  - 화면 단위로 커스텀 훅을 분리해 사용합니다.
- **주요 커스텀 훅**

  - `useImageUpload` – 업로드 상태 및 drag‑and‑drop 바인딩
  - `useLightManagement` – 조명 목록(현재는 단일), 위치/스케일/강도 관리
  - `useDragAndDrop` – 이미지 위 드롭, 조명 드래그/리사이즈 로직
  - `useImageGeneration` – 캔버스 합성 + 서버 업로드 + job polling + history/캐시 관리

- **캔버스 합성 로직**
  - `src/utils/canvasUtils.js`
    - `compositeImage(roomImage, lights, displaySize)`
    - `drawLightOnCanvas`
  - 이 유틸들은 **편집 화면의 좌표계(브라우저 렌더링 기준)** 를
    **원본 이미지 해상도 캔버스의 좌표계**로 변환하는 핵심 역할을 담당합니다.
  - 세로로 긴 이미지에서도 조명 비율이 깨지지 않도록, aspect ratio 보정 로직을 포함하고 있습니다.

---

### 4. 프로젝트 구조 (요약)

```bash
lumiply-client/
├── public/
│   ├── index.html
│   └── lumiply_client_cover.png   # README 커버 이미지
├── src/
│   ├── App.js
│   ├── App.css
│   ├── components/
│   │   ├── ImageEditor/           # 업로드 후 조명 배치 화면
│   │   ├── LightCarousel/         # 조명 선택/프리셋 관련 (필요 시)
│   │   ├── ResultComparison/      # Before/After 슬라이더
│   │   ├── ResultHistory/         # 우측 히스토리 카드
│   │   ├── UploadZone/            # 초기 업로드 화면
│   │   └── LightOverlay/          # 이미지 위 조명 렌더링
│   ├── hooks/
│   │   ├── useImageUpload.js
│   │   ├── useLightManagement.js
│   │   ├── useDragAndDrop.js
│   │   └── useImageGeneration.js
│   ├── utils/
│   │   └── canvasUtils.js
│   └── constants/
│       ├── defaultValues.js
│       └── colorPalette.js        # 팔레트 정의 (색상 키, 라벨, 스타일 등)
└── README.md
```

각 디렉터리는 이름 자체가 역할을 드러내도록 구성했습니다.  
예를 들어, 결과 뷰 관련 UI는 대부분 `Result*` 네이밍을 따라가므로 처음 보는 사람도 쉽게 찾아갈 수 있습니다.

---

### 5. 상태/히스토리 관리 방식

- **세션 내 상태 (in-memory)**
  - 현재 업로드된 이미지, 배치된 조명 정보, 현재 선택한 색상, 진행률 등은 React state로 관리합니다.
- **영구 히스토리 (`localStorage`)**
  - 모델 호출이 성공적으로 끝나면, 다음 정보를 묶어서 하나의 히스토리 엔트리로 저장합니다.
    - `id` (UUID)
    - 입력 composite 이미지 URL
    - 7가지 색상별 결과 이미지 URL
    - 마지막으로 선택한 color key
    - 생성 시각, 상태 메시지 등
  - 애플리케이션 시작 시 `localStorage` 를 읽어 초기 히스토리를 복원합니다.
  - 개별 삭제 / 전체 삭제 시 `localStorage` 와 메모리 상태를 함께 갱신합니다.
- **디자인 의도**
  - 로그인 기능이 없는 환경에서 **이전 결과를 쉽게 다시 불러볼 수 있게** 하기 위함입니다.
  - 브라우저 캐시/쿠키 삭제 전까지는 기본적인 “유저별 최근 작업 기록”이 유지됩니다.

---

### 6. 환경 변수

백엔드 주소를 바꾸고 싶을 때는 프로젝트 루트에 `.env` 파일을 만들고 다음 값을 설정합니다.

```env
REACT_APP_API_URL=http://localhost:8000
```

- 설정하지 않으면 기본값은 `http://localhost:8000` 으로 동작합니다.
- 코드 상에서는 `API_BASE_URL` 로 래핑하여 import 해 사용합니다.
- 실제 배포 환경에서는 이 값을 서버 배포 주소에 맞게 수정하면 됩니다.

---

### 7. 실행 방법 (개발용)

개발 환경에서 실행하는 절차는 일반적인 CRA 프로젝트와 동일합니다.

```bash
cd lumiply-client
npm install         # 또는 yarn
npm start           # 또는 yarn start
```

- 기본 접속 URL: `http://localhost:3000`
- FastAPI 서버는 `http://localhost:8000` 에 떠 있다고 가정합니다.
- CORS 관련 오류가 뜬다면:
  - 서버 레포(`lumiply-server`)의 `.env` 에서 `CORS_ORIGINS` 에  
    `http://localhost:3000` 이 포함되어 있는지 확인이 필요합니다.

빌드:

```bash
npm run build
```

- 빌드 결과는 `build/` 폴더에 생성되며, 정적 호스팅 환경에 그대로 올릴 수 있습니다.

---

### 8. 프론트 ↔ 백엔드 API 연동 요약

- **업로드:** `POST {API_BASE_URL}/api/upload`
  - `multipart/form-data` (`image`: 캔버스에서 합성한 PNG)
  - response 예시:
    - `job_id` – 이후 상태 조회에 사용하는 식별자
- **상태 폴링:** `GET {API_BASE_URL}/api/status/{job_id}`
  - 진행 중:
    - `status`: `"processing"`
    - `progress`: 0–100
    - `message`: `"red 색상 생성 중"`, `"전송 완료"` 등
  - 완료 시:
    - `result.images[color]` – 색상별 결과 이미지 URL
    - `result.input_image_url` – 입력 composite 이미지 URL
- **다운로드:** `GET {API_BASE_URL}/api/download_image?path=...&filename=...`
  - 현재 선택된 색상의 결과 이미지 URL을 `path` 로 전달하고,
  - 파일명(`YYYYMMDD_HHMMSS_output_<color>.ext`)을 `filename` 으로 넘겨 브라우저 다운로드를 트리거합니다.
