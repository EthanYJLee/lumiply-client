import React from "react";

/**
 * 선택된 조명 제품의 상세 정보를 표시하는 컴포넌트
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

