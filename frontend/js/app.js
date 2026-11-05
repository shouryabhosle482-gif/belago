const apiBase = '/api';

const statsStatusEl = document.getElementById('statsStatus');
const homepageStatsEls = {
  totalListings: document.querySelector('[data-stat="totalListings"]'),
  activeListings: document.querySelector('[data-stat="activeListings"]'),
  registeredStudents: document.querySelector('[data-stat="registeredStudents"]'),
  verifiedSellers: document.querySelector('[data-stat="verifiedSellers"]')
};

document.getElementById('year').textContent = new Date().getFullYear();

const formatStatValue = (value) => {
  const numeric = Number(value) || 0;
  if (numeric >= 1000) {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(numeric);
  }
  return new Intl.NumberFormat('en-IN').format(numeric);
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

function setStatsLoading(isLoading) {
  document.querySelectorAll('.stat-card').forEach((card) => {
    card.classList.toggle('is-loading', isLoading);
  });
}

function renderHomepageStats(response) {
  const data = response?.data || {};
  Object.entries(homepageStatsEls).forEach(([key, el]) => {
    if (!el) return;
    const value = data[key];
    el.textContent = typeof value === 'number' ? formatStatValue(value) : '--';
  });

  const lastUpdated = data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'now';
  if (statsStatusEl) {
    statsStatusEl.textContent = `Updated ${lastUpdated}`;
  }
  setStatsLoading(false);
}

function renderUnavailableStats() {
  Object.values(homepageStatsEls).forEach((el) => {
    if (el) el.textContent = '--';
  });

  if (statsStatusEl) {
    statsStatusEl.textContent = 'Live stats unavailable right now. Please try again shortly.';
  }

  setStatsLoading(false);
}

async function loadHomepageStats() {
  const cards = document.querySelectorAll('.stat-card');
  if (cards.length) {
    setStatsLoading(true);
    if (statsStatusEl) statsStatusEl.textContent = 'Loading live marketplace numbers…';
  }

  try {
    const stats = await fetchJson(`${apiBase}/statistics/homepage`);
    if (stats?.success) {
      renderHomepageStats(stats);
      return;
    }
    throw new Error(stats?.message || 'Statistics could not be loaded');
  } catch (error) {
    console.error('Homepage statistics update failed', error);
    renderUnavailableStats();
  }
}

window.addEventListener('belago:stats-refresh', () => {
  loadHomepageStats();
});

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

document.querySelectorAll('.hero-search').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input');
    const value = input?.value.trim() || '';
    window.location.href = `/explore${value ? `?q=${encodeURIComponent(value)}` : ''}`;
  });
});

const promoSlides = Array.from(document.querySelectorAll('.promo-slide'));
const promoDots = Array.from(document.querySelectorAll('.promo-dot'));
const promoArrows = Array.from(document.querySelectorAll('.promo-arrow'));

if (promoSlides.length > 0) {
  let currentSlide = 0;

  function showPromoSlide(index) {
    currentSlide = (index + promoSlides.length) % promoSlides.length;

    promoSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    promoDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  promoDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showPromoSlide(index);
    });
  });

  promoArrows.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.direction === 'next' ? 1 : -1;
      showPromoSlide(currentSlide + direction);
    });
  });

  setInterval(() => showPromoSlide(currentSlide + 1), 5000);
}

loadHomepageStats();
setInterval(() => loadHomepageStats(), 60000);
loadHomeContent();
