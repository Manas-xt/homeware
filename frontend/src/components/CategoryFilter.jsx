export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Filter by category">
      <button
        className={`pill ${!active ? 'pill--active' : ''}`}
        onClick={() => onSelect(null)}
        role="tab"
        aria-selected={!active}
      >
        All pieces
      </button>
      {categories.map((c) => (
        <button
          key={c.CategoryId}
          className={`pill ${active === c.Slug ? 'pill--active' : ''}`}
          onClick={() => onSelect(c.Slug)}
          role="tab"
          aria-selected={active === c.Slug}
        >
          {c.Name}
        </button>
      ))}
    </div>
  );
}
