import React, { useEffect, useState } from "react";

/**
 * 조명 선택 캐러셀 컴포넌트
 */
const LightCarousel = ({ onLightSelect, onLightDragStart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const res = await fetch("/products.json");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (e) {
        // 로컬 개발 환경에서만 사용하는 정적 파일이라 에러는 로그만 남기고 무시
        // eslint-disable-next-line no-console
        console.error("failed to load products.json", e);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="light-carousel">
      <div className="carousel-header">제품 옵션</div>
      <div className="carousel-content">
        {products.map((product, index) => {
          const imagePath = `/${product.file}`;
          return (
            <div
              key={`${product.name}-${index}`}
              className="light-item"
              draggable
              onDragStart={(e) => onLightDragStart(e, imagePath)}
              onClick={() => onLightSelect(imagePath)}
            >
              <div className="light-item-inner">
                <div className="light-thumb">
                  <img
                    src={imagePath}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                </div>
                <div className="light-meta">
                  <div className="light-name">{product.name}</div>
                  <div className="light-brand">
                    {product.brand}
                    {product.color ? ` · ${product.color}` : ""}
                  </div>
                  {product.price && <div className="light-price">{product.price}원</div>}
                  {product.link && (
                    <a
                      className="light-link"
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      상품 상세 보기
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LightCarousel;
