import React from "react";
import ResultView from "../components/ResultView/ResultView";
import ResultHistory from "../components/ResultHistory/ResultHistory";
import ProductInfo from "../components/ProductInfo/ProductInfo";

/**
 * 결과 보기 화면 (/result) 의 전체 레이아웃을 담당하는 페이지 컴포넌트입니다.
 *
 * - 좌측: 입력/결과 뷰(ResultView)
 * - 우측 상단: 결과 히스토리(ResultHistory)
 * - 우측 하단: 선택된 조명 상품 정보(ProductInfo)
 *
 * 히스토리/상품 선택 등 상위(App)에서 관리되는 상태를 그대로 전달하는 얇은 래퍼 역할을 합니다.
 */
const ResultPage = ({
  previewUrl,
  imagesByColor,
  initialColorKey,
  history,
  activeHistoryId,
  onHistorySelect,
  onHistoryRemove,
  onHistoryClearAll,
  selectedProductData,
}) => {
  return (
    <div className="editor-container result-view-container">
      <ResultView previewUrl={previewUrl} imagesByColor={imagesByColor} initialColorKey={initialColorKey} />
      <div className="right-column">
        <div className="right-column-top">
          <ResultHistory
            history={history}
            activeId={activeHistoryId}
            onSelect={onHistorySelect}
            onRemove={onHistoryRemove}
            onClearAll={onHistoryClearAll}
          />
        </div>
        <div className="right-column-bottom">
          <ProductInfo productData={selectedProductData} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
