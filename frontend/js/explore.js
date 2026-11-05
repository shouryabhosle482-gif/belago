const apiBase = '/api';

const params = new URLSearchParams(window.location.search);
const preselectedCategory = params.get('category') || 'all';
const preSearch = params.get('q') || '';

const categorySelect = document.getElementById('categoryFilter');
if (categorySelect) {
  categorySelect.value = preselectedCategory;
}

const searchInput = document.getElementById('searchInput');
const headerSearchInput = document.getElementById('searchInputHeader');

if (searchInput) searchInput.value = preSearch;
if (headerSearchInput && !searchInput) headerSearchInput.value = preSearch;

const resultCount = document.getElementById('resultCount');
const grid = document.getElementById('marketplaceGrid');

function syncSearchFields(sourceInput) {
  if (!sourceInput) return;
  const target = searchInput || headerSearchInput;
  if (target) target.value = sourceInput.value;
}

function getQueryObject() {
  const category = categorySelect?.value || 'all';
  const condition = document.getElementById('conditionFilter')?.value || '';
  const minPrice = document.getElementById('minPrice')?.value || '';
  const maxPrice = document.getElementById('maxPrice')?.value || '';
  const college = document.getElementById('collegeFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || 'newest';
  const q = searchInput?.value.trim() || '';

  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (q) params.set('q', q);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (condition) params.set('condition', condition);
  if (college) params.set('college', college);
  if (sort) params.set('sort', sort);
  return params;
}

function renderMarketplaceCard(item) {
  return `
    <article class="listing-card">
      <div class="image-wrap">
        <img src="${item.image}" alt="${item.title}" />
        <button class="fav-button" type="button">♡</button>
      </div>
      <div class="listing-body">
        <div class="badge">${item.condition}</div>
        <h3 class="product-title">${item.title}</h3>
        <div class="price-row">
          <strong>₹${item.price.toLocaleString('en-IN')}</strong>
          ${item.originalPrice ? `<span>₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <div class="meta-row">
          <span>${item.sellerName}</span>
          <span>${item.college}</span>
          <span>${item.area}</span>
        </div>
        <div class="listing-actions">
          <button class="btn btn-secondary" type="button">Chat</button>
          <a href="/listing-details/${item.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    </article>
  `;
}

async function loadMarketplace() {
  try {
    const params = getQueryObject();
    const response = await fetch(`${apiBase}/listings?${params.toString()}`);
    const data = await response.json();
    const items = data.items || [];

    if (resultCount) resultCount.textContent = String(items.length);
    if (grid) {
      grid.innerHTML = items.length ? items.map(renderMarketplaceCard).join('') : `<div class="empty-state">No listings matched your filters. Try broadening your search.</div>`;
    }
  } catch (error) {
    console.error('Unable to load marketplace listings', error);
  }
}

['categoryFilter', 'conditionFilter', 'sortFilter', 'minPrice', 'maxPrice', 'collegeFilter'].forEach((id) => {
  const element = document.getElementById(id);
  element?.addEventListener('input', loadMarketplace);
  element?.addEventListener('change', loadMarketplace);
});

document.getElementById('marketplaceSearch')?.addEventListener('submit', (event) => {
  event.preventDefault();
  loadMarketplace();
});

document.getElementById('marketplaceSearchHeader')?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (headerSearchInput && searchInput) {
    searchInput.value = headerSearchInput.value.trim();
  }
  loadMarketplace();
});

headerSearchInput?.addEventListener('input', () => syncSearchFields(headerSearchInput));
searchInput?.addEventListener('input', () => syncSearchFields(searchInput));

document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('conditionFilter').value = '';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('collegeFilter').value = '';
  document.getElementById('sortFilter').value = 'newest';
  if (searchInput) searchInput.value = '';
  if (headerSearchInput) headerSearchInput.value = '';
  loadMarketplace();
});

loadMarketplace();
