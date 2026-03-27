function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminUser');
  window.location.href = '/backend/admin';
}

function getStoredAdminEmail() {
  const directEmail = localStorage.getItem('adminEmail');
  if (directEmail) {
    return directEmail;
  }

  try {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    return user?.email || '';
  } catch (_error) {
    return '';
  }
}

function checkAuth() {
  const token = localStorage.getItem('adminToken');
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminEmail = getStoredAdminEmail().toLowerCase();
  const hasApprovedAdminSession = Boolean(token) && isLoggedIn && adminEmail === 'admin@edvo.com';
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage === '/admin' || currentPage === '/backend/admin' || currentPage === '/backend/admin/login';

  if (!hasApprovedAdminSession && !isLoginPage) {
    logout();
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

function humanizeAdminFieldName(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const adminFieldMeta = {
  actionUrl: {
    label: 'Redirect URL',
    help: 'Optional full URL to send users to another page.',
  },
  avatarFile: {
    label: 'Avatar image',
    help: 'Upload the avatar shown with this entry.',
  },
  bio: {
    label: 'Bio',
    help: 'This summary appears on the frontend team section.',
  },
  category: {
    label: 'Category',
    help: 'Choose or type the section where this item should appear.',
  },
  categoryDescription: {
    label: 'Category description',
    help: 'Optional note to help admins understand this category.',
  },
  categoryName: {
    label: 'Category name',
    help: 'Use the label visitors will see on the frontend.',
  },
  comment: {
    label: 'Review text',
    help: 'Paste the full review exactly as you want it displayed.',
  },
  companyLogoFile: {
    label: 'Company logo',
    help: 'Upload the logo shown with the learner story.',
  },
  content: {
    label: 'Full content',
    help: 'Add the full article body shown on the blog detail page.',
  },
  description: {
    label: 'Description',
    help: 'Keep this clear and helpful for the frontend preview.',
  },
  documentFile: {
    label: 'Tutorial document',
    help: 'Upload the file users download from the tutorial card.',
  },
  duration: {
    label: 'Duration',
    help: 'Write this the same way you want learners to see it.',
  },
  externalUrl: {
    label: 'External review link',
    help: 'Paste the full public URL, including https://.',
  },
  file: {
    label: 'Cover image',
    help: 'Upload the image shown in the preview and on the frontend.',
  },
  highlight: {
    label: 'Highlight',
    help: 'Short promise or outcome shown on the frontend card.',
  },
  href: {
    label: 'Page route',
    help: 'Use the site route or a full public URL.',
  },
  imageFile: {
    label: 'Featured image',
    help: 'Upload the main image visitors will see.',
  },
  level: {
    label: 'Difficulty level',
    help: 'Choose the learner level shown on the frontend.',
  },
  liveUrl: {
    label: 'Live URL',
    help: 'Paste the full meeting or livestream URL.',
  },
  order: {
    label: 'Display position',
    help: 'Smaller numbers appear first on the frontend.',
  },
  phase: {
    label: 'Phase',
    help: 'Select the current challenge phase shown to users.',
  },
  readTime: {
    label: 'Read time (minutes)',
    help: 'This number is shown on the blog card and article header.',
  },
  roadmapFile: {
    label: 'Roadmap file',
    help: 'Upload the file users download from the guide card.',
  },
  roadmapSteps: {
    label: 'Roadmap steps',
    help: 'Add one step per line in the order users should follow.',
  },
  speakerAvatarFile: {
    label: 'Speaker photo',
    help: 'Upload the speaker image shown on the event card.',
  },
  status: {
    label: 'Status',
    help: 'Choose whether this item is live, draft, or hidden.',
  },
  steps: {
    label: 'Step count',
    help: 'Number of roadmap steps shown on the frontend card.',
  },
  tags: {
    label: 'Tags',
    help: 'Separate each tag with a comma.',
  },
  thumbnailFile: {
    label: 'Thumbnail image',
    help: 'Upload the image shown in the blog card and article page.',
  },
  title: {
    label: 'Title',
    help: 'Use the public title visitors will see.',
  },
  tool: {
    label: 'Tool or topic',
    help: 'Use the tool or topic name learners will recognise.',
  },
  track: {
    label: 'Track name',
    help: 'Use the learning path name shown to visitors.',
  },
  visibility: {
    label: 'Visibility',
    help: 'Active items are visible on the frontend.',
  },
};

function getAdminFieldLabel(control) {
  const meta = adminFieldMeta[control.id || ''];
  if (meta?.label) {
    return meta.label;
  }

  const placeholder = String(control.getAttribute('placeholder') || '').trim();
  if (placeholder) {
    return placeholder.replace(/\s*\(optional\)\s*$/i, '');
  }

  if (control.tagName === 'SELECT' && control.options?.length) {
    const firstOption = String(control.options[0].textContent || '').trim();
    if (/^select\s+/i.test(firstOption)) {
      return humanizeAdminFieldName(firstOption.replace(/^select\s+/i, ''));
    }
  }

  return humanizeAdminFieldName(control.id || control.name || 'Field');
}

function getAdminFieldHelp(control) {
  const meta = adminFieldMeta[control.id || ''];
  return meta?.help || '';
}

function shouldEnhanceAdminControl(control) {
  if (!control || control.dataset.adminEnhanced === 'true') {
    return false;
  }

  if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(control.tagName)) {
    return false;
  }

  if (['hidden', 'search', 'checkbox', 'radio'].includes(control.type)) {
    return false;
  }

  if (
    control.classList.contains('filter-input')
    || control.classList.contains('filter-select')
    || control.closest('.field-shell')
    || control.closest('.toolbar')
    || control.closest('.filters')
    || control.closest('.table-wrap')
    || control.closest('.table-actions')
    || control.closest('.actions')
    || control.closest('.pill-actions')
    || control.closest('tbody')
    || control.closest('thead')
  ) {
    return false;
  }

  const parent = control.parentElement;
  if (!parent || parent.matches('label')) {
    return false;
  }

  if (control.previousElementSibling) {
    const sibling = control.previousElementSibling;
    if (
      sibling.tagName === 'LABEL'
      || sibling.classList.contains('field-label')
      || sibling.classList.contains('label')
    ) {
      return false;
    }
  }

  if (control.id) {
    const hasLabel = Array.from(parent.querySelectorAll('label')).some((label) => label.htmlFor === control.id);
    if (hasLabel) {
      return false;
    }
  }

  return parent === control.form
    || ['grid', 'stack', 'thumb-grid', 'grid-split'].some((className) => parent.classList.contains(className));
}

function wrapAdminField(control) {
  const parent = control.parentElement;
  if (!parent) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'field-shell';

  if (['category', 'status', 'visibility', 'phase', 'level'].includes(control.id)) {
    wrapper.classList.add('field-shell-key');
  }

  if (control.id === 'order') {
    wrapper.classList.add('field-shell-key', 'field-shell-order');
    if (control.getAttribute('placeholder')) {
      control.setAttribute('placeholder', '0 shows first');
    }
  }

  parent.insertBefore(wrapper, control);
  wrapper.appendChild(control);

  const labelText = getAdminFieldLabel(control);
  if (labelText) {
    const label = document.createElement('label');
    label.className = 'field-label';
    if (control.id) {
      label.htmlFor = control.id;
    }
    label.textContent = labelText;
    wrapper.insertBefore(label, control);
  }

  const helpText = getAdminFieldHelp(control);
  if (helpText) {
    const help = document.createElement('div');
    help.className = 'field-help';
    help.textContent = helpText;
    wrapper.appendChild(help);
  }

  control.dataset.adminEnhanced = 'true';
}

function enhanceAdminForms(root = document) {
  root.querySelectorAll('.dashboard-content form input, .dashboard-content form select, .dashboard-content form textarea').forEach((control) => {
    if (shouldEnhanceAdminControl(control)) {
      wrapAdminField(control);
    }
  });
}

function normalizeAdminCopy(root = document) {
  const replacements = [
    {
      pattern: /Use the Move Up and Move Down buttons[^.]*\./gi,
      replacement: 'Use "Move earlier" and "Move later" to set the frontend order.',
    },
  ];

  root.querySelectorAll('.help').forEach((node) => {
    const originalText = String(node.textContent || '').trim();
    if (!originalText) {
      return;
    }

    let nextText = originalText;
    replacements.forEach(({ pattern, replacement }) => {
      nextText = nextText.replace(pattern, replacement);
    });

    if (nextText !== originalText) {
      node.textContent = nextText;
    }
  });
}

function enhanceReorderButtons(root = document) {
  const buttonMap = {
    Up: {
      label: 'Move earlier',
      title: 'Move this item earlier in the frontend order',
      className: 'btn-reorder-up',
    },
    'Move Up': {
      label: 'Move earlier',
      title: 'Move this item earlier in the frontend order',
      className: 'btn-reorder-up',
    },
    Down: {
      label: 'Move later',
      title: 'Move this item later in the frontend order',
      className: 'btn-reorder-down',
    },
    'Move Down': {
      label: 'Move later',
      title: 'Move this item later in the frontend order',
      className: 'btn-reorder-down',
    },
  };

  root.querySelectorAll('button').forEach((button) => {
    const text = String(button.textContent || '').replace(/\s+/g, ' ').trim();
    const config = buttonMap[text];
    if (!config) {
      return;
    }

    button.textContent = config.label;
    button.title = config.title;
    button.setAttribute('aria-label', config.title);
    button.classList.add(config.className);
  });
}

let adminUiEnhancementsQueued = false;

function runAdminUiEnhancements() {
  adminUiEnhancementsQueued = false;
  enhanceAdminForms(document);
  normalizeAdminCopy(document);
  enhanceReorderButtons(document);
}

function queueAdminUiEnhancements() {
  if (adminUiEnhancementsQueued) {
    return;
  }

  adminUiEnhancementsQueued = true;
  window.requestAnimationFrame(runAdminUiEnhancements);
}

function initAdminUiEnhancements() {
  if (!document.querySelector('.dashboard-content')) {
    return;
  }

  queueAdminUiEnhancements();

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === 'childList' && mutation.addedNodes.length)) {
      queueAdminUiEnhancements();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

checkAuth();
initResponsiveAdminShell();
initAdminUiEnhancements();
