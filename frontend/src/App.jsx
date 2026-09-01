import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import { getCategories, getProducts } from './api.js';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timeout = setTimeout(() => {
      getProducts({ category: activeCategory, search })
        .then((data) => setProducts(data.items))
        .catch(() => setError('The catalog is unavailable right now. Please try again shortly.'))
        .finally(() => setLoading(false));
    }, 200); // debounce search typing
    return () => clearTimeout(timeout);
  }, [activeCategory, search]);

  return (
    <>
      <Header search={search} onSearchChange={setSearch} />

      <section className="hero">
        <div className="hero__inner">
          <p className="eyebrow">Considered objects for the home</p>
          <h1>
            Light finds its way
            <br />
            into everything we make.
          </h1>
          <p className="hero__copy">
            Brass, glass, linen and clay — each piece in the Lustre collection is chosen for how
            it catches the light in a room, morning or evening.
          </p>
          <a className="hero__cta" href="#catalog">
            Browse the catalog
          </a>
        </div>
        <div className="hero__sheen" aria-hidden="true" />
      </section>

      <main id="catalog" className="catalog">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
        <ProductGrid products={products} loading={loading} error={error} />
      </main>

      <footer className="site-footer" id="about">
        <p>Lustre Homeware — hand-finished pieces, made to be lived </p>
      </footer>
    </>
  );
}
