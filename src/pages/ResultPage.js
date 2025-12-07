import React from "react";
import ResultView from "../components/ResultView/ResultView";
import ResultHistory from "../components/ResultHistory/ResultHistory";
import ProductInfo from "../components/ProductInfo/ProductInfo";

/**
 * 결과 보기 화면 (/result)
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

