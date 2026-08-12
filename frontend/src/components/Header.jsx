export default function Header({ search, onSearchChange }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href="/">
          <span className="wordmark__mark">L</span>
          Lustre Homeware
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#catalog">Catalog</a>
          <a href="#about">Our craft</a>
        </nav>
        <div className="search-field">
          <input
            type="search"
            placeholder="Search the catalog"
            aria-label="Search products"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
