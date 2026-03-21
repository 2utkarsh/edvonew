// Shared Admin JavaScript

function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  window.location.href = '/backend/admin';
}

function checkAuth() {
  const token = localStorage.getItem('adminToken');
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage === '/admin' || currentPage === '/backend/admin' || currentPage === '/backend/admin/login';

  if (!token && !isLoggedIn && !isLoginPage) {
    window.location.href = '/backend/admin';
  }
}

async function adminFetch(url, options = {}) {
  const headers = {
    Accept: 'application/json',
    'X-Admin-Demo': 'true',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed');
  }

  return payload;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 10px;
    background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
    color: white;
    font-weight: 500;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

checkAuth();
