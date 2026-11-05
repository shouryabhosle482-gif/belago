const apiBase = '/api';

document.getElementById('year').textContent = new Date().getFullYear();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function renderCategoryCards(items) {
  const container = document.getElementById('categoryGrid');
  if (!container) return;

  container.innerHTML = items.slice(0, 6).map((item) => `
    <a href="/explore?category=${encodeURIComponent(item.id)}" class="category-card" aria-label="Browse ${item.name}">
      <img src="${item.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'}" alt="${item.name}" loading="lazy" />
      <div class="category-copy">
        <h3>${item.name}</h3>
        <p>${item.description || 'Discover listings in this category.'}</p>
        <small>${item.count ?? 0} active listings</small>
      </div>
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

loadHomeContent();
