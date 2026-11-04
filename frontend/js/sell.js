const sellForm = document.getElementById('sellForm');
const imageUpload = document.getElementById('itemImageUpload');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewBox = document.getElementById('imagePreviewBox');

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image upload failed. Please try another file.'));
    reader.readAsDataURL(file);
  });
}

imageUpload?.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('Please upload an image under 2MB for the best mobile experience.');
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    imagePreview.src = dataUrl;
    imagePreviewBox.hidden = false;
  } catch (error) {
    alert(error.message);
  }
});

sellForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('belagoToken');
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const selectedImage = imageUpload?.files?.[0];
  let imageDataUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

  if (selectedImage) {
    imageDataUrl = await readFileAsDataUrl(selectedImage).catch(() => imageDataUrl);
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
    image: imageDataUrl
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
    window.dispatchEvent(new CustomEvent('belago:stats-refresh'));
    sellForm.reset();
    imagePreviewBox.hidden = true;
    window.location.href = '/dashboard';
  } catch (error) {
    alert(error.message);
  }
});
