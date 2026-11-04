const sellForm = document.getElementById('sellForm');

sellForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('belagoToken');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const payload = {
    title: document.getElementById('itemTitle').value,
    category: document.getElementById('itemCategory').value,
    description: document.getElementById('itemDescription').value,
    price: document.getElementById('itemPrice').value,
    originalPrice: document.getElementById('itemOriginalPrice').value,
    condition: document.getElementById('itemCondition').value,
    college: document.getElementById('itemCollege').value,
    area: document.getElementById('itemArea').value,
    image: document.getElementById('itemImage').value || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  };

  try {
    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Listing failed');
    alert('Listing published successfully');
    sellForm.reset();
    window.location.href = '/dashboard';
  } catch (error) {
    alert(error.message);
  }
});
