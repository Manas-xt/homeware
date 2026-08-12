import { useState, useEffect } from 'react';

const SWATCHES = {
  lighting: 'swatch--brass',
  'vases-bowls': 'swatch--clay',
  textiles: 'swatch--linen',
  tableware: 'swatch--porcelain',
};

export default function ProductCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.ImageUrl || '');
  const swatchClass = SWATCHES[product.CategorySlug] || 'swatch--brass';
  const showImage = imgSrc && !imgFailed;

  useEffect(() => {
    setImgSrc(product.ImageUrl || '');
    setImgFailed(false);
  }, [product.ImageUrl]);

  return (
    <article className="product-card">
      <div className={`product-card__media ${swatchClass}`}>
        {showImage && (
          <img
            src={imgSrc}
            alt={product.Name}
            loading="lazy"
            onError={() => {
              // fallback to an inline SVG placeholder showing the product initial
              const initial = (product.Name && product.Name.charAt(0)) || '';
              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23e7ddce'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='120' fill='%232a2420'>${initial}</text></svg>`;
              const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
              setImgSrc(dataUri);
              setImgFailed(false);
            }}
          />
        )}
        <span className="product-card__sheen" aria-hidden="true" />
        {!showImage && <span className="product-card__monogram">{product.Name.charAt(0)}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.CategoryName}</p>
        <h3 className="product-card__name">{product.Name}</h3>
        <p className="product-card__material">{product.Material}</p>
        <p className="product-card__price">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.Currency || 'USD',
          }).format(product.Price)}
        </p>
      </div>
    </article>
  );
}
