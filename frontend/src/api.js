const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function getCategories() {
  return request('/categories');
}

export function getProducts({ category, search, page = 1, pageSize = 12 } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', page);
  params.set('pageSize', pageSize);
  return request(`/products?${params.toString()}`);
}

export function getProduct(slug) {
  return request(`/products/${slug}`);
}
