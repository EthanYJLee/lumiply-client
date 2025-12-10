import React from "react";

/**
 * 결과 화면 우측 하단에서 현재 선택된 조명 상품 정보를 보여주는 카드입니다.
 *
 * - 상품 이미지, 브랜드, 색상, 가격을 간단히 보여주고
 * - "구매하기" 버튼을 통해 외부 상세 페이지를 새 탭으로 엽니다.
 *
 * productData 가 없을 경우에는 비어 있는 상태 안내만 보여줍니다.
 */
const ProductInfo = ({ productData }) => {
  if (!productData) {
    return (
      <div className="product-info-card">
        <div className="product-info-empty">
          <p>조명 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  const handleBuyClick = () => {
    if (productData.link) {
      window.open(productData.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="product-info-card">
      <div className="product-info-header">
        <div className="product-info-title">선택한 조명</div>
      </div>
      <div className="product-info-content">
        <div className="product-info-image-wrapper">
          <img src={`/${productData.file}`} alt={productData.name} className="product-info-image" />
        </div>
        <div className="product-info-details">
          <div className="product-info-name">{productData.name}</div>
          <div className="product-info-brand">{productData.brand}</div>
          <div className="product-info-meta">
            <span className="product-info-color">Color: {productData.color}</span>
          </div>
          <div className="product-info-price">₩ {productData.price}</div>
        </div>
      </div>
      <div className="product-info-actions">
        <button
          type="button"
          className="product-info-buy-button"
          onClick={handleBuyClick}
          disabled={!productData.link}
        >
          구매하기
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;

