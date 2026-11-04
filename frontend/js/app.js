const apiBase = '/api';

document.getElementById('year').textContent = new Date().getFullYear();

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function renderCategoryCards(items) {
  const container = document.getElementById('categoryGrid');
  if (!container) return;

  const icons = ['B', 'M', 'S', 'C', 'A', 'L'];
  container.innerHTML = items.slice(0, 12).map((item, index) => `
    <a href="/explore?category=${encodeURIComponent(item.id)}" class="category-card">
      <div class="icon-box">${icons[index % icons.length]}</div>
      <h3>${item.name}</h3>
      <small>${item.count} active listings</small>
    </a>
  `).join('');
}

function renderListingCard(item) {
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

async function loadHomeContent() {
  try {
    const [categoriesRes, listingRes] = await Promise.all([
      fetchJson(`${apiBase}/categories`),
      fetchJson(`${apiBase}/listings/featured`)
    ]);

    renderCategoryCards(categoriesRes.items);

    const featured = listingRes.items || [];
    const container = document.getElementById('featuredListings');
    if (container) {
      container.innerHTML = featured.map(renderListingCard).join('');
    }

    const recent = await fetchJson(`${apiBase}/listings?sort=newest`);
    const recentContainer = document.getElementById('recentListings');
    if (recentContainer) {
      recentContainer.innerHTML = (recent.items || []).slice(0, 4).map(renderListingCard).join('');
    }
  } catch (error) {
    console.error('Home content failed to load', error);
  }
}

document.getElementById('homeSearchForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = document.getElementById('homeSearchInput').value.trim();
  window.location.href = `/explore${value ? `?q=${encodeURIComponent(value)}` : ''}`;
});

loadHomeContent();
