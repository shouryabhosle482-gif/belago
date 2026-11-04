const detailContainer = document.getElementById('listingDetail');
const similarContainer = document.getElementById('similarListings');

async function loadListingDetail() {
  const id = window.location.pathname.split('/').pop();
  if (!id || !detailContainer) return;

  try {
    const response = await fetch(`/api/listings/${id}`);
    if (!response.ok) throw new Error('Listing not found');
    const data = await response.json();
    const item = data.item;

    detailContainer.innerHTML = `
      <article class="detail-card">
        <div class="gallery-large">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        <div class="detail-info">
          <div class="badge">${item.condition}</div>
          <h1>${item.title}</h1>
          <div class="price-line">
            <strong>₹${item.price.toLocaleString('en-IN')}</strong>
            ${item.originalPrice ? `<span>₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="detail-meta">
            <span>${item.category}</span>
            <span>${item.college}</span>
            <span>${item.area}</span>
          </div>
          <p>${item.description}</p>
          <div class="detail-actions">
            <button class="btn btn-primary" type="button">Chat with Seller</button>
            <button class="btn btn-secondary" type="button">Make an Offer</button>
          </div>
          <div class="seller-box">
            <div>
              <strong>${item.sellerName}</strong>
              <small>Verified student seller</small>
            </div>
            <div>
              <strong>4.9 ★</strong>
            </div>
          </div>
        </div>
      </article>
    `;

    if (similarContainer) {
      similarContainer.innerHTML = (data.similar || []).map((entry) => `
        <article class="listing-card">
          <div class="image-wrap">
            <img src="${entry.image}" alt="${entry.title}" />
          </div>
          <div class="listing-body">
            <h3 class="product-title">${entry.title}</h3>
            <div class="price-row">
              <strong>₹${entry.price.toLocaleString('en-IN')}</strong>
            </div>
            <div class="listing-actions">
              <a href="/listing-details/${entry.id}" class="btn btn-primary">View</a>
            </div>
          </div>
        </article>
      `).join('');
    }
  } catch (error) {
    detailContainer.innerHTML = `<div class="empty-state">Listing not available.</div>`;
  }
}

loadListingDetail();
