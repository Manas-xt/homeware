import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return <p className="state-message">Gathering the collection…</p>;
  }
  if (error) {
    return <p className="state-message state-message--error">{error}</p>;
  }
  if (products.length === 0) {
    return <p className="state-message">Nothing here yet — try another category or search term.</p>;
  }
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.ProductId} product={p} />
      ))}
    </div>
  );
}
