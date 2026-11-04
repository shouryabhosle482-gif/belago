const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const getToken = () => localStorage.getItem('belagoToken');

async function setAuth(token, user) {
  localStorage.setItem('belagoToken', token);
  localStorage.setItem('belagoUser', JSON.stringify(user));
  window.location.href = '/dashboard';
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    await setAuth(data.token, data.user);
  } catch (error) {
    alert(error.message);
  }
});

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    fullName: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    password: document.getElementById('regPassword').value,
    confirmPassword: document.getElementById('regConfirm').value,
    college: document.getElementById('regCollege').value,
    area: document.getElementById('regArea').value
  };

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    await setAuth(data.token, data.user);
  } catch (error) {
    alert(error.message);
  }
});

if (window.location.pathname === '/login' && getToken()) {
  window.location.href = '/dashboard';
}
