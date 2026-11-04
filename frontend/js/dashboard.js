const token = localStorage.getItem('belagoToken');

if (!token) {
  window.location.href = '/login';
}

async function loadDashboard() {
  if (!token) return;
  try {
    const response = await fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Dashboard unavailable');

    const stats = document.getElementById('dashboardStats');
    if (stats) {
      stats.innerHTML = `
        <div><strong>${data.stats.activeListings}</strong><span>Active Listings</span></div>
        <div><strong>${data.stats.soldItems}</strong><span>Sold Items</span></div>
        <div><strong>${data.stats.myOrders}</strong><span>My Orders</span></div>
        <div><strong>${data.stats.myOffers}</strong><span>My Offers</span></div>
      `;
    }

    const listings = document.getElementById('myListings');
    if (listings) {
      listings.innerHTML = data.myListings.length
        ? data.myListings.map((item) => `
          <div class="listing-card">
            <div class="image-wrap"><img src="${item.image}" alt="${item.title}" /></div>
            <div class="listing-body">
              <h3 class="product-title">${item.title}</h3>
              <div class="price-row"><strong>₹${item.price.toLocaleString('en-IN')}</strong></div>
              <div class="listing-actions">
                <a href="/listing-details/${item.id}" class="btn btn-primary">View</a>
              </div>
            </div>
          </div>
        `).join('')
        : '<div class="empty-state">No listings yet. Start by listing your first item.</div>';
    }
  } catch (error) {
    alert(error.message);
    window.location.href = '/login';
  }
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('belagoToken');
  localStorage.removeItem('belagoUser');
  window.location.href = '/';
});

loadDashboard();
