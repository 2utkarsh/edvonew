function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminUser');
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
  const token = localStorage.getItem('adminToken');
  const method = String(options.method || 'GET').toUpperCase();
  const targetUrl =
    method === 'GET' && typeof url === 'string'
      ? `${url}${url.includes('?') ? '&' : '?'}adminv=20260325c`
      : url;
  const headers = {
    Accept: 'application/json',
    'X-Admin-Demo': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(targetUrl, {
    ...options,
    method,
    cache: method === 'GET' ? 'no-store' : options.cache,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      logout();
    }
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
    max-width: min(360px, calc(100vw - 32px));
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

function initResponsiveAdminShell() {
  const sidebar = document.querySelector('.sidebar');
  const topBar = document.querySelector('.top-bar');
  if (!sidebar || !topBar || document.querySelector('.sidebar-toggle')) {
    return;
  }

  let topBarLeft = topBar.querySelector('.top-bar-left');
  if (!topBarLeft) {
    topBarLeft = document.createElement('div');
    topBarLeft.className = 'top-bar-left';

    const title = topBar.querySelector('.page-title');
    if (title) {
      topBar.insertBefore(topBarLeft, topBar.firstChild);
      topBarLeft.appendChild(title);
    } else {
      topBar.insertBefore(topBarLeft, topBar.firstChild);
    }
  }

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'sidebar-toggle';
  toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.innerHTML = '<span></span><span></span><span></span>';
  topBarLeft.insertBefore(toggleButton, topBarLeft.firstChild);

  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    toggleButton.setAttribute('aria-expanded', 'false');
  };

  const openSidebar = () => {
    sidebar.classList.add('is-open');
    overlay.classList.add('active');
    document.body.classList.add('sidebar-open');
    toggleButton.setAttribute('aria-expanded', 'true');
  };

  toggleButton.addEventListener('click', () => {
    if (sidebar.classList.contains('is-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) {
      closeSidebar();
    }
  });
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
  @media (max-width: 768px) {
    .toast {
      left: 16px;
      right: 16px;
      top: 16px;
      max-width: none;
    }
  }
`;
document.head.appendChild(style);

checkAuth();
initResponsiveAdminShell();
