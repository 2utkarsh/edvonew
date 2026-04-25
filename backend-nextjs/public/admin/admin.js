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
  if (!sidebar || !topBar) {
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

  let toggleButton = topBarLeft.querySelector('.sidebar-toggle');
  if (!toggleButton) {
    toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'sidebar-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    toggleButton.innerHTML = '<span></span><span></span><span></span>';
    topBarLeft.insertBefore(toggleButton, topBarLeft.firstChild);
  }

  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  if (toggleButton.dataset.bound === 'true') {
    return;
  }
  toggleButton.dataset.bound = 'true';

  const applyMobileSidebarState = () => {
    const isMobile = window.innerWidth <= 992;
    const isOpen = sidebar.classList.contains('is-open');

    if (!isMobile) {
      sidebar.style.removeProperty('transform');
      sidebar.style.removeProperty('visibility');
      sidebar.style.removeProperty('pointer-events');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      toggleButton.setAttribute('aria-expanded', 'false');
      return;
    }

    sidebar.style.transform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
    sidebar.style.visibility = isOpen ? 'visible' : 'hidden';
    sidebar.style.pointerEvents = isOpen ? 'auto' : 'none';
    overlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('sidebar-open', isOpen);
    toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('is-open');
    applyMobileSidebarState();
  };

  const openSidebar = () => {
    sidebar.classList.add('is-open');
    applyMobileSidebarState();
  };

  toggleButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (sidebar.classList.contains('is-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeSidebar();
  });
  sidebar.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  document.addEventListener('click', (event) => {
    if (window.innerWidth > 992 || !sidebar.classList.contains('is-open')) {
      return;
    }

    const clickTarget = event.target;
    if (sidebar.contains(clickTarget) || toggleButton.contains(clickTarget)) {
      return;
    }

    closeSidebar();
  });
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
      return;
    }
    applyMobileSidebarState();
  });

  applyMobileSidebarState();
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
const richEditorStyle = document.createElement('style');
richEditorStyle.textContent = `
  .admin-rich-textarea-native {
    position: absolute !important;
    left: -9999px !important;
    width: 1px !important;
    height: 1px !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .cke {
    width: 100% !important;
  }
  .cke_chrome {
    border: 1px solid #d7deef !important;
    border-radius: 18px !important;
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  }
  .cke_top {
    border-bottom: 1px solid rgba(148, 163, 184, 0.24) !important;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
  }
  .cke_contents {
    min-height: 180px;
  }
  .admin-rich-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    border: 1px solid #d7deef;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    padding: 12px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
  }
  .admin-rich-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .admin-rich-toolbar-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .admin-rich-toolbar-divider {
    width: 1px;
    align-self: stretch;
    min-height: 36px;
    background: #d7deef;
    border-radius: 999px;
  }
  .admin-rich-button {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid #d7deef;
    border-radius: 12px;
    background: #ffffff;
    color: #334155;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .admin-rich-button:hover {
    border-color: #667eea;
    box-shadow: 0 10px 22px rgba(102, 126, 234, 0.14);
    transform: translateY(-1px);
  }
  .admin-rich-button.is-active {
    border-color: #667eea;
    background: #eef2ff;
    color: #3c4bb7;
    box-shadow: 0 10px 22px rgba(102, 126, 234, 0.16);
  }
  .admin-rich-select,
  .admin-rich-color {
    min-height: 36px;
    border: 1px solid #d7deef;
    border-radius: 12px;
    background: #ffffff;
    color: #334155;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .admin-rich-select {
    min-width: 118px;
    padding: 0 12px;
  }
  .admin-rich-color {
    width: 44px;
    padding: 4px;
    cursor: pointer;
  }
  .admin-rich-surface {
    min-height: 200px;
    padding: 16px 18px;
    border: 1px solid #d7deef;
    border-radius: 16px;
    background: #ffffff;
    color: #1e293b;
    line-height: 1.75;
    font-size: 0.95rem;
    outline: none;
  }
  .admin-rich-surface.is-empty::before {
    content: attr(data-placeholder);
    color: #94a3b8;
  }
  .admin-rich-surface h2 {
    margin: 0 0 12px;
    font-size: 1.28rem;
    font-weight: 800;
    line-height: 1.4;
  }
  .admin-rich-surface p {
    margin: 0 0 12px;
  }
  .admin-rich-surface blockquote {
    margin: 0 0 12px;
    padding-left: 16px;
    border-left: 4px solid #c7d2fe;
    color: #475569;
  }
  .admin-rich-surface ul,
  .admin-rich-surface ol {
    margin: 0 0 12px;
    padding-left: 22px;
  }
  .admin-rich-surface a {
    color: #4f46e5;
    text-decoration: underline;
  }
  .admin-rich-surface img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 0 14px;
    border-radius: 14px;
  }
  .admin-rich-surface table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 14px;
  }
  .admin-rich-surface th,
  .admin-rich-surface td {
    border: 1px solid #d7deef;
    padding: 10px 12px;
    vertical-align: top;
  }
`;
document.head.appendChild(richEditorStyle);

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
  photoFile: {
    label: 'Profile photo',
    help: 'Upload the photo shown for this instructor profile.',
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
    label: 'Free course material',
    help: 'Upload the file users download from the free course card.',
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
  partnerLogoFile: {
    label: 'Partner logo',
    help: 'Upload the logo shown in the hiring partner section.',
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
  testimonialImageFile: {
    label: 'Testimonial photo',
    help: 'Upload the photo shown with this testimonial.',
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
  const base = meta?.help || '';
  const ratio = String(control?.dataset?.adminAspectRatio || '').trim();
  const note = String(control?.dataset?.adminAspectNote || '').trim();
  const aspect = ratio ? `Aspect ratio: ${ratio}${note ? ` (${note})` : ''}.` : '';
  return [base, aspect].filter(Boolean).join(' ');
}

function parseAdminAspectRatio(value) {
  const source = String(value || '').trim();
  if (!source) {
    return null;
  }

  const parts = source.split(':').map((part) => Number(part.trim()));
  if (parts.length !== 2 || !parts.every((part) => Number.isFinite(part) && part > 0)) {
    return null;
  }

  return {
    width: parts[0],
    height: parts[1],
    ratio: parts[0] / parts[1],
    label: source,
  };
}

function getAdminImageAspectConfig(control) {
  const aspect = parseAdminAspectRatio(control?.dataset?.adminAspectRatio || '');
  if (!aspect) {
    return null;
  }

  const tolerance = Number(control?.dataset?.adminAspectTolerance || 0.04);
  return {
    ...aspect,
    tolerance: Number.isFinite(tolerance) && tolerance > 0 ? tolerance : 0.04,
  };
}

function readAdminFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

function readAdminImageSize(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to inspect image size'));
    };

    image.src = objectUrl;
  });
}

async function readAdminImageFile(file, control) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Please choose an image file');
  }

  const config = getAdminImageAspectConfig(control);
  if (config) {
    const size = await readAdminImageSize(file);
    const ratio = size.width / size.height;
    if (Math.abs(ratio - config.ratio) > config.tolerance) {
      const label = getAdminFieldLabel(control);
      throw new Error(`${label} must use ${config.label} aspect ratio.`);
    }
  }

  return readAdminFileAsDataUrl(file);
}

function injectAdminImageAspectHints(root = document) {
  root.querySelectorAll('input[type="file"][data-admin-aspect-ratio]').forEach((control) => {
    if (control.dataset.adminAspectHintInjected === 'true') {
      return;
    }

    control.dataset.adminAspectHintInjected = 'true';
    if (control.closest('.field-shell')) {
      return;
    }

    const helpText = getAdminFieldHelp(control);
    if (!helpText) {
      return;
    }

    const help = document.createElement('div');
    help.className = 'field-help';
    help.textContent = helpText;

    if (control.nextSibling) {
      control.parentElement?.insertBefore(help, control.nextSibling);
    } else {
      control.parentElement?.appendChild(help);
    }
  });
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

  injectAdminImageAspectHints(root);
}

window.readAdminImageFile = readAdminImageFile;

const adminTextareaValueDescriptor = typeof HTMLTextAreaElement !== 'undefined'
  ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
  : null;

const adminRichAllowedTags = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'u', 'ul',
]);

const adminRichDiscardTags = new Set([
  'button', 'canvas', 'datalist', 'embed', 'form', 'head', 'iframe', 'input', 'link', 'meta', 'noscript',
  'object', 'option', 'script', 'select', 'style', 'svg', 'template', 'textarea', 'title',
]);

const adminRichAllowedStyles = new Set([
  'background', 'background-color', 'color', 'font-family', 'font-size', 'font-style', 'font-weight',
  'letter-spacing', 'line-height', 'list-style-type', 'margin', 'margin-bottom', 'margin-left',
  'margin-right', 'margin-top', 'padding', 'padding-left', 'text-align', 'text-decoration',
  'text-decoration-color', 'text-decoration-line', 'text-indent', 'vertical-align', 'white-space',
]);

const adminRichPositiveHintPattern = /description|desc\b|content|bio|comment|note|summary|overview|details|message|answer|text|quote|objective|review|story|body|copy|caption|statement|excerpt|full description|short description/i;
const adminRichNegativeHintPattern = /one per line|starter code|test case|expected output|roadmap steps|skills\b|tags\b|slug\b|search\b|url\b|link\b|email\b|input\b|output\b|options\b|eligibility\b|rules\b|steps\b|deliverables\b|tools\b|requirements\b|offerings\b|what students learn\b|featured outcomes\b|features\b/i;

function appendAdminRichStyle(target, property, value) {
  const nextValue = String(value || '').trim();
  if (!nextValue) {
    return;
  }

  const current = target.getAttribute('style') || '';
  const withoutProperty = current
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.toLowerCase().startsWith(`${property.toLowerCase()}:`));

  withoutProperty.push(`${property}: ${nextValue}`);
  target.setAttribute('style', withoutProperty.join('; '));
}

function getAdminRichHint(control) {
  const parts = [
    control.id || '',
    control.name || '',
    control.dataset.k || '',
    control.getAttribute('placeholder') || '',
    control.getAttribute('aria-label') || '',
    control.dataset.adminRichHint || '',
  ];

  if (control.id) {
    document.querySelectorAll(`label[for="${control.id}"]`).forEach((label) => {
      parts.push(label.textContent || '');
    });
  }

  const nearbyField = control.closest('.field-shell, .admin-field, .field, .thumb-wrap');
  if (nearbyField) {
    [...nearbyField.children].forEach((child) => {
      if (child.tagName === 'LABEL') {
        parts.push(child.textContent || '');
      }
    });
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function shouldEnhanceRichText(control) {
  if (!(control instanceof HTMLTextAreaElement)) {
    return false;
  }

  if (control.dataset.adminRichEnhanced === 'true') {
    return false;
  }

  if (
    control.closest('.toolbar')
    || control.closest('.filters')
  ) {
    return false;
  }

  const hint = getAdminRichHint(control);
  if (control.dataset.adminRich === 'true') {
    return true;
  }
  if (control.dataset.adminRich === 'false' || adminRichNegativeHintPattern.test(hint)) {
    return false;
  }

  return adminRichPositiveHintPattern.test(hint) || !adminRichNegativeHintPattern.test(hint);
}

function escapeAdminHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toRichEditorHtml(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (/<\/?[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeAdminHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function sanitizeAdminRichUrl(value, attribute) {
  const candidate = String(value || '').trim();
  if (!candidate) {
    return '';
  }

  if (attribute === 'src' && /^(data:image\/|blob:|https?:\/\/|\/)/i.test(candidate)) {
    return candidate;
  }

  if (attribute === 'href' && /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(candidate)) {
    return candidate;
  }

  return '';
}

function sanitizeAdminRichStyle(value) {
  return String(value || '')
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((styles, entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex === -1) {
        return styles;
      }

      const property = entry.slice(0, separatorIndex).trim().toLowerCase();
      const rawValue = entry.slice(separatorIndex + 1).trim();
      if (!adminRichAllowedStyles.has(property) || !rawValue) {
        return styles;
      }

      const normalizedValue = rawValue.replace(/\s+/g, ' ').trim();
      if (/url\s*\(|expression\s*\(|javascript:/i.test(normalizedValue)) {
        return styles;
      }

      styles.push(`${property}: ${normalizedValue.replace(/[<>]/g, '')}`);
      return styles;
    }, [])
    .join('; ');
}

function parseAdminRichCssRules(value) {
  const source = String(value || '')
    .replace(/<!--|-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');

  const rules = [];
  const pattern = /([^{}]+)\{([^{}]+)\}/g;
  let match = pattern.exec(source);

  while (match) {
    const selectorText = String(match[1] || '').trim();
    const declarations = String(match[2] || '').trim();

    if (selectorText && declarations && !selectorText.startsWith('@')) {
      const selectors = selectorText
        .split(',')
        .map((selector) => selector.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((selector) => !selector.startsWith('@'))
        .filter((selector) => !selector.includes(':'))
        .filter((selector) => !selector.includes('['));

      if (selectors.length) {
        rules.push({ selectors, declarations });
      }
    }

    match = pattern.exec(source);
  }

  return rules;
}

function inlineAdminRichCssRules(parsedDocument) {
  const styleText = [...parsedDocument.querySelectorAll('style')]
    .map((styleNode) => styleNode.textContent || '')
    .join('\n');

  if (!styleText.trim()) {
    return;
  }

  parseAdminRichCssRules(styleText).forEach(({ selectors, declarations }) => {
    selectors.forEach((selector) => {
      try {
        parsedDocument.querySelectorAll(selector).forEach((element) => {
          const currentStyle = element.getAttribute('style') || '';
          element.setAttribute('style', [declarations, currentStyle].filter(Boolean).join('; '));
        });
      } catch (_error) {
        // Ignore unsupported selectors from pasted HTML.
      }
    });
  });
}

function sanitizeAdminRichNode(node, ownerDocument) {
  if (node.nodeType === Node.TEXT_NODE) {
    return ownerDocument.createTextNode(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const sourceElement = node;
  const sourceTag = sourceElement.tagName.toLowerCase();
  const normalizedTag = sourceTag === 'b' ? 'strong' : sourceTag === 'i' ? 'em' : sourceTag;

  if (adminRichDiscardTags.has(normalizedTag)) {
    return null;
  }

  if (!adminRichAllowedTags.has(normalizedTag)) {
    const fragment = ownerDocument.createDocumentFragment();
    sourceElement.childNodes.forEach((childNode) => {
      const safeChild = sanitizeAdminRichNode(childNode, ownerDocument);
      if (safeChild) {
        fragment.appendChild(safeChild);
      }
    });
    return fragment;
  }

  const safeElement = ownerDocument.createElement(normalizedTag);
  const style = sanitizeAdminRichStyle(sourceElement.getAttribute('style') || '');
  if (style) {
    safeElement.setAttribute('style', style);
  }

  const align = String(sourceElement.getAttribute('align') || '').trim().toLowerCase();
  if (align && ['left', 'center', 'right', 'justify'].includes(align)) {
    appendAdminRichStyle(safeElement, 'text-align', align);
  }

  if (normalizedTag === 'a') {
    const href = sanitizeAdminRichUrl(sourceElement.getAttribute('href'), 'href');
    if (href) {
      safeElement.setAttribute('href', href);
      safeElement.setAttribute('target', '_blank');
      safeElement.setAttribute('rel', 'noopener noreferrer');
    }
  }

  if (normalizedTag === 'img') {
    const src = sanitizeAdminRichUrl(sourceElement.getAttribute('src'), 'src');
    if (!src) {
      return null;
    }

    safeElement.setAttribute('src', src);
    safeElement.setAttribute('alt', sourceElement.getAttribute('alt') || 'Pasted image');

    ['width', 'height'].forEach((attribute) => {
      const value = parseInt(String(sourceElement.getAttribute(attribute) || ''), 10);
      if (value > 0 && Number.isFinite(value)) {
        safeElement.setAttribute(attribute, String(value));
      }
    });
  }

  if (normalizedTag === 'td' || normalizedTag === 'th') {
    ['colspan', 'rowspan'].forEach((attribute) => {
      const value = parseInt(String(sourceElement.getAttribute(attribute) || ''), 10);
      if (value > 0 && Number.isFinite(value)) {
        safeElement.setAttribute(attribute, String(value));
      }
    });
  }

  sourceElement.childNodes.forEach((childNode) => {
    const safeChild = sanitizeAdminRichNode(childNode, ownerDocument);
    if (safeChild) {
      safeElement.appendChild(safeChild);
    }
  });

  return safeElement;
}

function sanitizeAdminRichHtml(value) {
  const html = String(value || '').trim();
  if (!html) {
    return '';
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');
  inlineAdminRichCssRules(parsed);
  const fragment = document.createDocumentFragment();

  parsed.body.childNodes.forEach((node) => {
    const safeNode = sanitizeAdminRichNode(node, document);
    if (safeNode) {
      fragment.appendChild(safeNode);
    }
  });

  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

function normalizeAdminRichMarkup(editor) {
  if (!editor) {
    return;
  }

  editor.querySelectorAll('font').forEach((fontNode) => {
    const span = document.createElement('span');
    const size = parseInt(String(fontNode.getAttribute('size') || ''), 10);
    const face = fontNode.getAttribute('face');
    const color = fontNode.getAttribute('color');

    if (size > 0) {
      const fontSizeMap = {
        1: '12px',
        2: '14px',
        3: '16px',
        4: '18px',
        5: '24px',
        6: '32px',
        7: '40px',
      };
      appendAdminRichStyle(span, 'font-size', fontSizeMap[size] || '16px');
    }

    if (face) {
      appendAdminRichStyle(span, 'font-family', face);
    }

    if (color) {
      appendAdminRichStyle(span, 'color', color);
    }

    const extraStyle = sanitizeAdminRichStyle(fontNode.getAttribute('style') || '');
    if (extraStyle) {
      span.setAttribute('style', [span.getAttribute('style') || '', extraStyle].filter(Boolean).join('; '));
    }

    while (fontNode.firstChild) {
      span.appendChild(fontNode.firstChild);
    }

    fontNode.replaceWith(span);
  });

  editor.querySelectorAll('[style]').forEach((node) => {
    const style = sanitizeAdminRichStyle(node.getAttribute('style') || '');
    if (style) {
      node.setAttribute('style', style);
      return;
    }

    node.removeAttribute('style');
  });
}

function toggleRichEditorPlaceholder(editor) {
  const plainText = String(editor.textContent || '').replace(/\u00a0/g, ' ').trim();
  const hasStructuredContent = Boolean(editor.querySelector('img, iframe, video, ul li, ol li, blockquote, table'));
  editor.classList.toggle('is-empty', !plainText && !hasStructuredContent);
}

function getNativeTextareaValue(textarea) {
  if (adminTextareaValueDescriptor?.get) {
    return adminTextareaValueDescriptor.get.call(textarea);
  }
  return textarea.value;
}

function setNativeTextareaValue(textarea, value) {
  if (adminTextareaValueDescriptor?.set) {
    adminTextareaValueDescriptor.set.call(textarea, value);
    return;
  }
  textarea.value = value;
}

function syncRichEditorFromTextarea(textarea) {
  const editor = textarea._adminRichEditor;
  if (!editor || textarea.dataset.adminRichSyncing === 'true') {
    return;
  }

  textarea.dataset.adminRichSyncing = 'true';
  const nextHtml = sanitizeAdminRichHtml(toRichEditorHtml(getNativeTextareaValue(textarea)));
  if (editor.innerHTML !== nextHtml) {
    editor.innerHTML = nextHtml;
  }
  normalizeAdminRichMarkup(editor);
  toggleRichEditorPlaceholder(editor);
  textarea.dataset.adminRichSyncing = 'false';
}

function syncTextareaFromRichEditor(textarea) {
  const editor = textarea._adminRichEditor;
  if (!editor) {
    return;
  }

  normalizeAdminRichMarkup(editor);
  const cleaned = sanitizeAdminRichHtml(editor.innerHTML);

  setNativeTextareaValue(textarea, cleaned);
  toggleRichEditorPlaceholder(editor);
}

function patchRichTextareaValue(textarea) {
  if (textarea.dataset.adminRichValuePatched === 'true' || !adminTextareaValueDescriptor) {
    return;
  }

  Object.defineProperty(textarea, 'value', {
    configurable: true,
    enumerable: adminTextareaValueDescriptor.enumerable,
    get() {
      return adminTextareaValueDescriptor.get.call(this);
    },
    set(nextValue) {
      adminTextareaValueDescriptor.set.call(this, nextValue);
      if (this._adminCkEditor) {
        syncCkEditorFromTextarea(this);
        return;
      }
      syncRichEditorFromTextarea(this);
    },
  });

  textarea.dataset.adminRichValuePatched = 'true';
}

const ADMIN_CKEDITOR_ASSET_TOKEN = '20260413f';
const ADMIN_CKEDITOR5_SCRIPT = 'https://cdn.ckeditor.com/ckeditor5/48.0.0/ckeditor5.umd.js';
const ADMIN_CKEDITOR5_STYLE = 'https://cdn.ckeditor.com/ckeditor5/48.0.0/ckeditor5.css';
let adminCkEditorLoaderPromise = null;
let adminCkEditorSequence = 0;

function getAdminCkEditorLicenseKey() {
  const licenseKey = String(
    window.__EDVO_CKEDITOR4_LICENSE_KEY__
    || window.CKEDITOR4_LICENSE_KEY
    || '',
  ).trim();

  return licenseKey;
}

function getAdminCkEditor5LicenseKey() {
  const licenseKey = String(
    window.__EDVO_CKEDITOR5_LICENSE_KEY__
    || window.CKEDITOR5_LICENSE_KEY
    || '',
  ).trim();

  return licenseKey;
}

function getAdminCkEditorScriptSrc() {
  return ADMIN_CKEDITOR5_SCRIPT;
}

function ensureAdminCkEditorStyles() {
  if (document.querySelector('link[data-admin-ckeditor-style="true"]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${ADMIN_CKEDITOR5_STYLE}?v=${ADMIN_CKEDITOR_ASSET_TOKEN}`;
  link.dataset.adminCkeditorStyle = 'true';
  document.head.appendChild(link);
}

function loadAdminCkEditorAssets() {
  if (window.CKEDITOR?.ClassicEditor) {
    return Promise.resolve(window.CKEDITOR);
  }

  if (adminCkEditorLoaderPromise) {
    return adminCkEditorLoaderPromise;
  }

  adminCkEditorLoaderPromise = new Promise((resolve, reject) => {
    ensureAdminCkEditorStyles();

    const existingScript = document.querySelector('script[data-admin-ckeditor-script="true"]');
    if (existingScript) {
      if (window.CKEDITOR?.ClassicEditor) {
        resolve(window.CKEDITOR);
        return;
      }

      existingScript.addEventListener('load', () => {
        if (window.CKEDITOR?.ClassicEditor) {
          resolve(window.CKEDITOR);
          return;
        }
        reject(new Error('CKEditor 5 did not initialize'));
      }, { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load CKEditor script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `${getAdminCkEditorScriptSrc()}?v=${ADMIN_CKEDITOR_ASSET_TOKEN}`;
    script.async = true;
    script.dataset.adminCkeditorScript = 'true';
    script.onload = () => {
      if (window.CKEDITOR?.ClassicEditor) {
        resolve(window.CKEDITOR);
        return;
      }
      reject(new Error('CKEditor 5 did not initialize'));
    };
    script.onerror = () => reject(new Error('Unable to load CKEditor script'));
    document.head.appendChild(script);
  }).catch((error) => {
    adminCkEditorLoaderPromise = null;
    throw error;
  });

  return adminCkEditorLoaderPromise;
}

function getAdminCkEditorPlugins() {
  const CKEDITOR = window.CKEDITOR;
  if (!CKEDITOR) {
    return [];
  }

  const pluginNames = [
    'Essentials',
    'Paragraph',
    'Heading',
    'Bold',
    'Italic',
    'Underline',
    'Link',
    'List',
    'BlockQuote',
    'Table',
    'TableToolbar',
    'Image',
    'ImageToolbar',
    'ImageCaption',
    'ImageStyle',
    'ImageUpload',
    'MediaEmbed',
    'Alignment',
    'Font',
    'SourceEditing',
  ];

  return pluginNames
    .map((name) => CKEDITOR[name])
    .filter((plugin) => typeof plugin === 'function');
}

function getAdminCkEditorToolbarItems() {
  const CKEDITOR = window.CKEDITOR || {};
  const items = [];
  const add = (pluginName, pluginItems) => {
    if (typeof CKEDITOR[pluginName] !== 'function') {
      return;
    }
    pluginItems.forEach((item) => items.push(item));
  };

  add('Essentials', ['undo', 'redo']);
  add('Heading', ['heading']);
  add('Bold', ['bold']);
  add('Italic', ['italic']);
  add('Underline', ['underline']);
  add('Link', ['link']);
  add('List', ['bulletedList', 'numberedList']);
  add('BlockQuote', ['blockQuote']);
  add('Table', ['insertTable']);
  add('Alignment', ['alignment']);
  add('Font', ['fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor']);
  add('MediaEmbed', ['mediaEmbed']);
  add('SourceEditing', ['sourceEditing']);

  return items;
}

function getAdminCkEditorConfig(textarea) {
  const toolbarItems = getAdminCkEditorToolbarItems();
  const plugins = getAdminCkEditorPlugins();
  const licenseKey = getAdminCkEditor5LicenseKey() || 'GPL';
  const config = {
    licenseKey,
    placeholder: textarea.placeholder || '',
    toolbar: {
      items: toolbarItems.length ? toolbarItems : ['undo', 'redo'],
    },
  };

  if (plugins.length) {
    config.plugins = plugins;
  }

  if (toolbarItems.includes('insertTable') && typeof window.CKEDITOR?.TableToolbar === 'function') {
    config.table = {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    };
  }

  if (typeof window.CKEDITOR?.ImageToolbar === 'function') {
    config.image = {
      toolbar: ['toggleImageCaption', 'imageTextAlternative'],
    };
  }

  return config;
}

function syncTextareaFromCkEditor(textarea) {
  const editor = textarea._adminCkEditor;
  if (!editor || typeof editor.getData !== 'function') {
    return;
  }

  const cleaned = sanitizeAdminRichHtml(editor.getData());
  textarea.dataset.adminRichSyncing = 'true';
  setNativeTextareaValue(textarea, cleaned);
  textarea.dataset.adminRichSyncing = 'false';
}

function syncCkEditorFromTextarea(textarea) {
  const editor = textarea._adminCkEditor;
  if (!editor || typeof editor.setData !== 'function' || textarea.dataset.adminRichSyncing === 'true') {
    return;
  }

  const nextHtml = sanitizeAdminRichHtml(toRichEditorHtml(getNativeTextareaValue(textarea)));
  if (editor.getData() !== nextHtml) {
    textarea.dataset.adminRichSyncing = 'true';
    try {
      editor.setData(nextHtml);
    } catch (error) {
      textarea.dataset.adminRichSyncing = 'false';
      throw error;
    }
    textarea.dataset.adminRichSyncing = 'false';
  }
}

function initAdminCkEditor(textarea) {
  if (textarea._adminRichEditor || textarea._adminCkEditor || textarea.dataset.adminCkInitializing === 'true') {
    return;
  }

  textarea.dataset.adminCkInitializing = 'true';
  patchRichTextareaValue(textarea);
  textarea.classList.add('admin-rich-textarea-native');

  adminCkEditorSequence += 1;
  const editorHost = document.createElement('div');
  editorHost.className = 'admin-ckeditor5-host';
  editorHost.dataset.adminCkHost = 'true';
  editorHost.dataset.adminCkHostId = String(adminCkEditorSequence);
  editorHost.innerHTML = toRichEditorHtml(getNativeTextareaValue(textarea));
  textarea.insertAdjacentElement('afterend', editorHost);

  loadAdminCkEditorAssets()
    .then((CKEDITOR) => new Promise((resolve, reject) => {
      if (!CKEDITOR?.ClassicEditor) {
        reject(new Error('CKEditor 5 build missing ClassicEditor'));
        return;
      }

      CKEDITOR.ClassicEditor.create(editorHost, getAdminCkEditorConfig(textarea))
        .then((editor) => resolve(editor))
        .catch((error) => reject(error));
    }))
    .then((editor) => {
      textarea._adminCkEditor = editor;
      textarea._adminCkHost = editorHost;
      textarea.dataset.adminRichEnhanced = 'true';
      textarea.setAttribute('data-admin-rich-enhanced', 'true');
      if (editor.model?.document) {
        editor.model.document.on('change:data', () => syncTextareaFromCkEditor(textarea));
      }
      syncCkEditorFromTextarea(textarea);
    })
    .catch((error) => {
      console.error('CKEditor initialization failed:', error);
      if (textarea._adminCkEditor && typeof textarea._adminCkEditor.destroy === 'function') {
        textarea._adminCkEditor.destroy();
      }
      textarea._adminCkEditor = null;
      textarea._adminCkHost = null;
      textarea.classList.remove('admin-rich-textarea-native');
      if (editorHost && editorHost.parentNode) {
        editorHost.parentNode.removeChild(editorHost);
      }
      showToast('CKEditor 5 could not load. Using the built-in editor instead.', 'error');
      textarea.dataset.adminRichEnhanced = 'false';
      initAdminRichEditor(textarea);
    })
    .finally(() => {
      textarea.dataset.adminCkInitializing = 'false';
    });
}

function initAdminRichEditor(textarea) {
  if (textarea._adminRichEditor || textarea._adminCkEditor) {
    return;
  }

  patchRichTextareaValue(textarea);

  const wrapper = document.createElement('div');
  wrapper.className = 'admin-rich-editor';

  const toolbar = document.createElement('div');
  toolbar.className = 'admin-rich-toolbar';

  const primaryGroup = document.createElement('div');
  primaryGroup.className = 'admin-rich-toolbar-group';

  const buttons = {
    bold: buildRichEditorButton(textarea, 'Bold', 'bold'),
    italic: buildRichEditorButton(textarea, 'Italic', 'italic'),
    underline: buildRichEditorButton(textarea, 'Underline', 'underline'),
    insertUnorderedList: buildRichEditorButton(textarea, 'Bullets', 'insertUnorderedList'),
    insertOrderedList: buildRichEditorButton(textarea, 'Numbered', 'insertOrderedList'),
    justifyLeft: buildRichEditorButton(textarea, 'Left', 'justifyLeft'),
    justifyCenter: buildRichEditorButton(textarea, 'Center', 'justifyCenter'),
    justifyRight: buildRichEditorButton(textarea, 'Right', 'justifyRight'),
    createLink: buildRichEditorButton(textarea, 'Link', 'createLink'),
    removeFormat: buildRichEditorButton(textarea, 'Clear', 'removeFormat'),
  };

  [
    buttons.bold,
    buttons.italic,
    buttons.underline,
    buttons.insertUnorderedList,
    buttons.insertOrderedList,
    buttons.justifyLeft,
    buttons.justifyCenter,
    buttons.justifyRight,
    buttons.createLink,
    buttons.removeFormat,
  ].forEach((button) => primaryGroup.appendChild(button));

  const divider = document.createElement('div');
  divider.className = 'admin-rich-toolbar-divider';

  const fontFamilyOptions = [
    'Arial',
    'Georgia',
    'Helvetica',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
  ];
  const fontSizeOptions = ['14px', '16px', '18px', '24px', '32px'];

  const secondaryGroup = document.createElement('div');
  secondaryGroup.className = 'admin-rich-toolbar-group';

  const fontFamily = buildRichEditorSelect({
    label: 'Font',
    values: fontFamilyOptions.map((option) => ({
      value: option,
      label: option,
      style: `font-family: ${option};`,
    })),
    onChange(value) {
      const editor = textarea._adminRichEditor;
      if (!editor) {
        return;
      }
      editor.focus();
      enableAdminStyleWithCss();
      document.execCommand('fontName', false, value);
      normalizeAdminRichMarkup(editor);
      syncTextareaFromRichEditor(textarea);
      updateRichToolbarState(textarea);
      fontFamily.value = '';
    },
  });

  const fontSize = buildRichEditorSelect({
    label: 'Size',
    values: fontSizeOptions.map((option) => ({ value: option, label: option })),
    onChange(value) {
      applyAdminFontSize(textarea, value);
      fontSize.value = '';
    },
  });

  const foreColor = buildRichEditorColor({
    label: 'Text color',
    defaultValue: '#1e293b',
    onChange(value) {
      runRichTextCommand(textarea, 'foreColor', value);
    },
  });

  const highlightColor = buildRichEditorColor({
    label: 'Highlight color',
    defaultValue: '#fff59d',
    onChange(value) {
      runRichTextCommand(textarea, 'hiliteColor', value);
    },
  });

  [fontFamily, fontSize, foreColor, highlightColor].forEach((control) => secondaryGroup.appendChild(control));

  toolbar.appendChild(primaryGroup);
  toolbar.appendChild(divider);
  toolbar.appendChild(secondaryGroup);

  const editor = document.createElement('div');
  editor.className = 'admin-rich-surface';
  editor.contentEditable = 'true';
  editor.spellcheck = true;
  editor.dataset.placeholder = textarea.getAttribute('placeholder') || 'Write here...';

  wrapper.appendChild(toolbar);
  wrapper.appendChild(editor);

  textarea.classList.add('admin-rich-textarea-native');
  textarea.setAttribute('data-admin-rich-enhanced', 'true');
  textarea.dataset.adminRichEnhanced = 'true';
  textarea.insertAdjacentElement('afterend', wrapper);

  textarea._adminRichEditor = editor;
  textarea._adminRichControls = {
    buttons,
    fontFamily,
    fontFamilyOptions,
    fontSize,
    fontSizeOptions,
    foreColor,
    highlightColor,
  };

  syncRichEditorFromTextarea(textarea);

  editor.addEventListener('input', () => {
    syncTextareaFromRichEditor(textarea);
    updateRichToolbarState(textarea);
  });
  editor.addEventListener('focus', () => updateRichToolbarState(textarea));
  editor.addEventListener('click', () => updateRichToolbarState(textarea));
  editor.addEventListener('keyup', () => updateRichToolbarState(textarea));
  editor.addEventListener('mouseup', () => updateRichToolbarState(textarea));
  editor.addEventListener('blur', () => syncTextareaFromRichEditor(textarea));
  editor.addEventListener('paste', (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    event.preventDefault();
    const imageItems = Array.from(clipboard.items || []).filter((item) => item.type.startsWith('image/'));
    if (imageItems.length) {
      readAdminClipboardImages(imageItems).then((chunks) => {
        insertAdminRichHtml(textarea, chunks.filter(Boolean).join(''));
      });
      return;
    }

    const html = clipboard.getData('text/html');
    if (html) {
      insertAdminRichHtml(textarea, html);
      return;
    }

    insertAdminRichPlainText(textarea, clipboard.getData('text/plain'));
  });

  updateRichToolbarState(textarea);
}

function enableAdminStyleWithCss() {
  try {
    document.execCommand('styleWithCSS', false, true);
  } catch (_error) {
    // Ignore browsers that do not support styleWithCSS.
  }
}

function insertAdminRichHtml(textarea, html) {
  const editor = textarea._adminRichEditor;
  if (!editor || !html) {
    return;
  }

  editor.focus();
  enableAdminStyleWithCss();
  document.execCommand('insertHTML', false, sanitizeAdminRichHtml(html));
  normalizeAdminRichMarkup(editor);
  syncTextareaFromRichEditor(textarea);
  updateRichToolbarState(textarea);
}

function insertAdminRichPlainText(textarea, value) {
  const text = String(value || '');
  if (!text) {
    return;
  }

  insertAdminRichHtml(textarea, toRichEditorHtml(text));
}

function readAdminClipboardImages(items) {
  return Promise.all(items.map((item) => new Promise((resolve) => {
    const file = item.getAsFile();
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve(`<p><img src="${String(reader.result || '')}" alt="${escapeAdminHtml(file.name || 'Pasted image')}" /></p>`);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  })));
}

function toAdminHexColor(value, fallback = '#1e293b') {
  const source = String(value || '').trim();
  if (!source || source === 'transparent') {
    return fallback;
  }

  if (/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0(?:\.0+)?\s*\)/i.test(source)) {
    return fallback;
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(source)) {
    if (source.length === 4) {
      return `#${source.slice(1).split('').map((char) => char + char).join('')}`.toLowerCase();
    }
    return source.toLowerCase();
  }

  const match = source.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return fallback;
  }

  const toHex = (part) => Number(part).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function findAdminSelectionContainer(editor) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const anchorNode = selection.anchorNode;
  const element = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
  return element && editor.contains(element) ? element : null;
}

function updateRichToolbarState(textarea) {
  const editor = textarea._adminRichEditor;
  const controls = textarea._adminRichControls;
  if (!editor || !controls) {
    return;
  }

  const activeNode = findAdminSelectionContainer(editor) || editor;
  const computed = window.getComputedStyle(activeNode);

  const activeStates = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    insertOrderedList: document.queryCommandState('insertOrderedList'),
    justifyLeft: document.queryCommandState('justifyLeft'),
    justifyCenter: document.queryCommandState('justifyCenter'),
    justifyRight: document.queryCommandState('justifyRight'),
  };

  Object.entries(controls.buttons).forEach(([command, button]) => {
    button.classList.toggle('is-active', Boolean(activeStates[command]));
  });

  const fontFamily = String(computed.fontFamily || '').replace(/["']/g, '').split(',')[0].trim();
  const availableFont = controls.fontFamilyOptions.find((option) => option.toLowerCase() === fontFamily.toLowerCase());
  controls.fontFamily.value = availableFont || '';

  const fontSize = `${Math.round(parseFloat(computed.fontSize || '16'))}px`;
  controls.fontSize.value = controls.fontSizeOptions.includes(fontSize) ? fontSize : '';
  controls.foreColor.value = toAdminHexColor(computed.color, '#1e293b');
  controls.highlightColor.value = toAdminHexColor(computed.backgroundColor, '#fff59d');
}

function applyAdminFontSize(textarea, value) {
  if (!value) {
    return;
  }

  const editor = textarea._adminRichEditor;
  if (!editor) {
    return;
  }

  editor.focus();
  enableAdminStyleWithCss();
  document.execCommand('fontSize', false, '7');
  editor.querySelectorAll('font[size="7"]').forEach((node) => {
    node.removeAttribute('size');
    appendAdminRichStyle(node, 'font-size', value);
  });
  normalizeAdminRichMarkup(editor);
  syncTextareaFromRichEditor(textarea);
  updateRichToolbarState(textarea);
}

function buildRichEditorButton(textarea, label, command, value) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-rich-button';
  button.textContent = label;
  button.addEventListener('click', () => runRichTextCommand(textarea, command, value));
  return button;
}

function buildRichEditorSelect(options) {
  const select = document.createElement('select');
  select.className = 'admin-rich-select';
  select.setAttribute('aria-label', options.label);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = options.label;
  select.appendChild(placeholder);

  options.values.forEach((option) => {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    if (option.style) {
      element.style.cssText = option.style;
    }
    select.appendChild(element);
  });

  select.addEventListener('change', () => {
    if (!select.value) {
      return;
    }

    options.onChange(select.value);
  });

  return select;
}

function buildRichEditorColor(options) {
  const input = document.createElement('input');
  input.type = 'color';
  input.className = 'admin-rich-color';
  input.value = options.defaultValue;
  input.title = options.label;
  input.setAttribute('aria-label', options.label);
  input.addEventListener('input', () => options.onChange(input.value));
  return input;
}

function runRichTextCommand(textarea, command, value) {
  const editor = textarea._adminRichEditor;
  if (!editor) {
    return;
  }

  editor.focus();
  enableAdminStyleWithCss();

  if (command === 'createLink') {
    const link = window.prompt('Paste the full URL');
    if (!link) {
      return;
    }
    document.execCommand('createLink', false, link);
  } else {
    document.execCommand(command, false, value || null);
  }

  normalizeAdminRichMarkup(editor);
  syncTextareaFromRichEditor(textarea);
  updateRichToolbarState(textarea);
}

function syncAllRichTextEditors(root = document) {
  root.querySelectorAll('textarea[data-admin-rich-enhanced="true"]').forEach((textarea) => {
    if (textarea._adminCkEditor) {
      syncTextareaFromCkEditor(textarea);
      return;
    }
    syncTextareaFromRichEditor(textarea);
  });
}

function initAdminRichTextEditors(root = document) {
  root.querySelectorAll('.dashboard-content form textarea').forEach((textarea) => {
    if (!shouldEnhanceRichText(textarea)) {
      return;
    }
    initAdminCkEditor(textarea);
  });

  root.querySelectorAll('.dashboard-content form').forEach((form) => {
    if (form.dataset.adminRichBound === 'true') {
      return;
    }

    form.dataset.adminRichBound = 'true';
    form.addEventListener('submit', () => syncAllRichTextEditors(form), true);
    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        form.querySelectorAll('textarea[data-admin-rich-enhanced="true"]').forEach((textarea) => {
          if (textarea._adminCkEditor) {
            syncCkEditorFromTextarea(textarea);
            return;
          }
          syncRichEditorFromTextarea(textarea);
        });
        syncAllRichTextEditors(form);
      }, 0);
    });
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

function getAdminRouteMeta() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const segments = path.replace(/^\/backend\/admin/, '').split('/').filter(Boolean);
  const section = segments[0] || 'dashboard';
  let subsection = null;
  let mode = 'list';

  if (segments[1] === 'new' || segments[1] === 'edit') {
    mode = segments[1] === 'new' ? 'create' : 'edit';
  } else if (segments[1]) {
    subsection = segments[1];
    if (segments[2] === 'new' || segments[2] === 'edit') {
      mode = segments[2] === 'new' ? 'create' : 'edit';
    }
  }

  return { path: path || '/backend/admin/dashboard', section, subsection, mode };
}

function getAdminPagePresentation() {
  const route = getAdminRouteMeta();
  const path = route.path;
  const pageMap = {
    '/backend/admin/dashboard': {
      kicker: 'Operations',
      title: 'Executive Dashboard',
      subtitle: 'Track platform health, recent learning activity, and the content pipeline from one focused control surface.',
      chip: 'Live overview',
    },
    '/backend/admin/home-content': {
      kicker: 'Website CMS',
      title: 'Homepage Studio',
      subtitle: 'Shape the public landing experience, section flow, and supporting copy with cleaner editorial controls.',
      chip: 'Content workspace',
    },
    '/backend/admin/hiring-partners': {
      kicker: 'Partnerships',
      title: 'Hiring Partner Network',
      subtitle: 'Manage partner stories, social proof, and employer-facing content with a polished review workflow.',
      chip: 'Partner directory',
    },
    '/backend/admin/courses': {
      kicker: 'Learning Catalog',
      title: 'Courses Control Center',
      subtitle: 'Operate the catalog, pricing, mentors, and learner experience in a single structured workflow.',
      chip: 'Catalog ops',
    },
    '/backend/admin/instructors': {
      kicker: 'Faculty',
      title: 'Instructor Management',
      subtitle: 'Create instructor accounts, maintain expert profiles, and control who can teach on the platform.',
      chip: 'Mentor roster',
    },
    '/backend/admin/blogs': {
      kicker: 'Editorial',
      title: 'Blogs Workspace',
      subtitle: 'Publish, reorder, and refine articles with better editorial clarity and category control.',
      chip: 'Editorial queue',
    },
    '/backend/admin/tutorials': {
      kicker: 'Lead Generation',
      title: 'Free Courses Studio',
      subtitle: 'Maintain the free-learning library, downloadable resources, and conversion-ready messaging.',
      chip: 'Growth content',
    },
    '/backend/admin/guides': {
      kicker: 'Resources',
      title: 'Guides Library',
      subtitle: 'Organize roadmap content, downloadable assets, and structured knowledge pages for visitors.',
      chip: 'Knowledge base',
    },
    '/backend/admin/team': {
      kicker: 'Brand',
      title: 'Team Profiles',
      subtitle: 'Keep leadership and mentor presence sharp with consistent bios, imagery, and public-facing details.',
      chip: 'People directory',
    },
    '/backend/admin/course-reviews': {
      kicker: 'Trust',
      title: 'Course Reviews Console',
      subtitle: 'Moderate review content, highlight proof points, and keep learner testimonials publication-ready.',
      chip: 'Reputation',
    },
    '/backend/admin/job-success-stories': {
      kicker: 'Outcomes',
      title: 'Success Stories Archive',
      subtitle: 'Curate graduate wins, employer outcomes, and transformation narratives with a tighter publishing flow.',
      chip: 'Outcome proof',
    },
    '/backend/admin/events': {
      kicker: 'Programming',
      title: 'Events Command Center',
      subtitle: 'Coordinate live sessions, registrations, and event visibility through a calmer operational layout.',
      chip: 'Live schedule',
    },
    '/backend/admin/challenges': {
      kicker: 'Community',
      title: 'Challenges Hub',
      subtitle: 'Manage challenge launches, participation flow, and storytelling around community momentum.',
      chip: 'Community ops',
    },
  };

  if (pageMap[path]) {
    return pageMap[path];
  }

  const basePath = `/backend/admin/${route.section}`;
  const basePresentation = pageMap[basePath] || {
    kicker: 'Admin',
    title: document.querySelector('.page-title')?.textContent?.trim() || 'EDVO Admin',
    subtitle: 'Operate the EDVO platform with a cleaner, more structured workspace.',
    chip: 'Secure admin',
  };
  const subsectionLabel =
    route.subsection === 'categories'
      ? 'Categories'
      : route.subsection === 'subcategories'
        ? 'Sub Categories'
        : route.subsection
          ? humanizeAdminFieldName(route.subsection)
          : basePresentation.title;
  const actionLabel =
    route.mode === 'create' ? 'Create' : route.mode === 'edit' ? 'Edit' : 'Manage';

  return {
    kicker: basePresentation.kicker,
    title: route.mode === 'list' ? subsectionLabel : `${actionLabel} ${subsectionLabel.replace(/^Manage\s+/i, '')}`,
    subtitle:
      route.mode === 'list'
        ? basePresentation.subtitle
        : `${actionLabel} ${subsectionLabel.replace(/^Manage\s+/i, '').toLowerCase()} without mixing the table and form on the same screen.`,
    chip:
      route.mode === 'list'
        ? basePresentation.chip
        : route.mode === 'create'
          ? 'Create flow'
          : 'Edit flow',
  };
}

function decorateAdminNavigation(root = document) {
  const sidebar = root.querySelector('.sidebar');
  if (!sidebar || sidebar.dataset.navEnhanced === 'true') {
    return;
  }

  const route = getAdminRouteMeta();
  const navGroups = [
    {
      title: 'Main Menu',
      items: [
        { href: '/backend/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/backend/admin/home-content', label: 'Home Content', icon: '🏠' },
        { href: '/backend/admin/hiring-partners', label: 'Hiring Partners', icon: '🤝' },
      ],
    },
    {
      title: 'Learning',
      items: [
        {
          href: '/backend/admin/courses',
          label: 'Courses',
          icon: '📚',
          children: [
            { href: '/backend/admin/courses/categories', label: 'Categories' },
            { href: '/backend/admin/courses/subcategories', label: 'Sub Categories' },
            { href: '/backend/admin/courses', label: 'Courses' },
          ],
        },
        { href: '/backend/admin/instructors', label: 'Instructors', icon: '🎓' },
        {
          href: '/backend/admin/blogs',
          label: 'Blogs',
          icon: '✍️',
          children: [
            { href: '/backend/admin/blogs/categories', label: 'Categories' },
            { href: '/backend/admin/blogs', label: 'Blogs' },
          ],
        },
        {
          href: '/backend/admin/tutorials',
          label: 'Free Courses',
          icon: '🎬',
          children: [
            { href: '/backend/admin/tutorials/categories', label: 'Categories' },
            { href: '/backend/admin/tutorials', label: 'Free Courses' },
          ],
        },
        { href: '/backend/admin/guides', label: 'Guides', icon: '📖' },
      ],
    },
    {
      title: 'Community',
      items: [
        { href: '/backend/admin/events', label: 'Events', icon: '📅' },
        { href: '/backend/admin/challenges', label: 'Challenges', icon: '🏆' },
        {
          href: '/backend/admin/course-reviews',
          label: 'Course Reviews',
          icon: '⭐',
          children: [
            { href: '/backend/admin/course-reviews/categories', label: 'Categories' },
            { href: '/backend/admin/course-reviews', label: 'Reviews' },
          ],
        },
        { href: '/backend/admin/job-success-stories', label: 'Success Stories', icon: '💼' },
        { href: '/backend/admin/team', label: 'Team', icon: '👥' },
      ],
    },
    {
      title: 'Account',
      items: [
        { href: '#logout', label: 'Sign Out', icon: '🚪', logout: true },
      ],
    },
  ];

  const isActiveHref = (href) => {
    const current = route.path;
    const normalized = href.replace(/\/+$/, '');
    return current === normalized || current.startsWith(`${normalized}/`);
  };

  sidebar.innerHTML = `
    <a href="/backend/admin/dashboard" class="sidebar-logo">
      <img class="sidebar-logo-image" src="/images/edvo-official-logo-v10.png" alt="EDVO">
    </a>
    ${navGroups.map((group) => `
      <nav class="nav-section">
        <p class="nav-section-title">${group.title}</p>
        ${group.items.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const childActive = hasChildren && item.children.some((child) => isActiveHref(child.href));
          const active = hasChildren ? childActive : isActiveHref(item.href);
          const expanded = hasChildren && item.children.some((child) => isActiveHref(child.href));
          const triggerMarkup = hasChildren
            ? `
              <button type="button" class="nav-item${active ? ' active' : ''}" aria-expanded="${expanded ? 'true' : 'false'}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
                <span class="nav-caret">⌄</span>
              </button>
            `
            : `
              <a href="${item.logout ? '#' : item.href}" class="nav-item${active ? ' active' : ''}"${item.logout ? ' data-admin-logout="true"' : ''}>
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
              </a>
            `;
          return `
            <div class="nav-group${expanded ? ' is-open' : ''}">
              ${triggerMarkup}
              ${hasChildren ? `
                <div class="nav-children">
                  ${item.children.map((child) => `
                    <a href="${child.href}" class="nav-subitem${isActiveHref(child.href) ? ' active' : ''}">${child.label}</a>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </nav>
    `).join('')}
  `;

  sidebar.dataset.navEnhanced = 'true';

  sidebar.querySelectorAll('[data-admin-logout="true"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      logout();
    });
  });

  sidebar.querySelectorAll('.nav-group').forEach((group) => {
    const trigger = group.querySelector('.nav-item');
    const children = group.querySelector('.nav-children');
    if (!trigger || !children) {
      return;
    }

    trigger.addEventListener('click', () => {
      group.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', group.classList.contains('is-open') ? 'true' : 'false');
    });
  });
}

function enhanceAdminTopBar(root = document) {
  const topBar = root.querySelector('.top-bar');
  if (!topBar) {
    return;
  }

  const presentation = getAdminPagePresentation();
  const existingTitle = topBar.querySelector('.page-title');
  let topBarLeft = topBar.querySelector('.top-bar-left');
  if (!topBarLeft) {
    topBarLeft = document.createElement('div');
    topBarLeft.className = 'top-bar-left';
    topBar.insertBefore(topBarLeft, topBar.firstChild);
  }

  let heading = topBarLeft.querySelector('.page-heading');
  if (!heading) {
    heading = document.createElement('div');
    heading.className = 'page-heading';
    topBarLeft.appendChild(heading);
  }

  let kicker = heading.querySelector('.page-kicker');
  if (!kicker) {
    kicker = document.createElement('div');
    kicker.className = 'page-kicker';
    heading.appendChild(kicker);
  }
  kicker.textContent = presentation.kicker;

  if (existingTitle && existingTitle.parentElement !== heading) {
    heading.appendChild(existingTitle);
  }
  if (existingTitle) {
    existingTitle.textContent = presentation.title;
  }

  let subtitle = heading.querySelector('.page-subtitle');
  if (!subtitle) {
    subtitle = document.createElement('div');
    subtitle.className = 'page-subtitle';
    heading.appendChild(subtitle);
  }
  subtitle.textContent = presentation.subtitle;

  let topBarRight = topBar.querySelector('.top-bar-right');
  if (!topBarRight) {
    topBarRight = document.createElement('div');
    topBarRight.className = 'top-bar-right';
    topBar.appendChild(topBarRight);
  }

  let chip = topBarRight.querySelector('.admin-chip');
  if (!chip) {
    chip = document.createElement('div');
    chip.className = 'admin-chip';
    topBarRight.appendChild(chip);
  }
  chip.textContent = presentation.chip;

  let userMenu = topBar.querySelector('.user-menu');
  const userAvatar = topBar.querySelector('.user-avatar');
  if (!userMenu && userAvatar) {
    userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    topBarRight.appendChild(userMenu);
    userMenu.appendChild(userAvatar);
  } else if (userMenu && userMenu.parentElement !== topBarRight) {
    topBarRight.appendChild(userMenu);
  }

  if (!userMenu) {
    return;
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser') || '{}');
    } catch (_error) {
      return {};
    }
  })();

  let userInfo = userMenu.querySelector('.user-info');
  if (!userInfo) {
    userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userMenu.insertBefore(userInfo, userMenu.firstChild);
  }

  let userName = userInfo.querySelector('.user-name');
  if (!userName) {
    userName = document.createElement('div');
    userName.className = 'user-name';
    userInfo.appendChild(userName);
  }

  let userRole = userInfo.querySelector('.user-role');
  if (!userRole) {
    userRole = document.createElement('div');
    userRole.className = 'user-role';
    userInfo.appendChild(userRole);
  }

  const adminEmail = getStoredAdminEmail() || user.email || 'admin@edvo.com';
  userName.textContent = user.name || adminEmail;
  userRole.textContent = 'Platform Admin';

  const avatar = userMenu.querySelector('.user-avatar');
  if (avatar) {
    avatar.textContent = String(userName.textContent || 'A').trim().charAt(0).toUpperCase();
  }
}

function getAdminRouteLinks() {
  return [
    { href: '/backend/admin/home-content', name: 'Homepage', copy: 'Hero, social proof, and section flow.', meta: 'CMS' },
    { href: '/backend/admin/courses', name: 'Courses', copy: 'Catalog, modules, plans, and tracking.', meta: 'Learning' },
    { href: '/backend/admin/instructors', name: 'Instructors', copy: 'Faculty accounts, bios, and expertise.', meta: 'Faculty' },
    { href: '/backend/admin/blogs', name: 'Blogs', copy: 'Editorial publishing and categories.', meta: 'Content' },
    { href: '/backend/admin/tutorials', name: 'Free Courses', copy: 'Lead magnets, assets, and free learning.', meta: 'Growth' },
    { href: '/backend/admin/guides', name: 'Guides', copy: 'Roadmaps and downloadable resources.', meta: 'Resources' },
  ];
}

function getAdminFrontendTargets() {
  const path = window.location.pathname;
  const map = {
    '/backend/admin/home-content': [
      { href: '/', label: 'Open Website', primary: true },
    ],
    '/backend/admin/hiring-partners': [
      { href: '/hire-from-us', label: 'Open Hiring Page', primary: true },
    ],
    '/backend/admin/courses': [
      { href: '/courses', label: 'Open Courses', primary: true },
    ],
    '/backend/admin/instructors': [
      { href: '/team', label: 'Open Team Page', primary: true },
    ],
    '/backend/admin/blogs': [
      { href: '/blogs', label: 'Open Blog Index', primary: true },
    ],
    '/backend/admin/tutorials': [
      { href: '/free-courses', label: 'Open Free Courses', primary: true },
    ],
    '/backend/admin/guides': [
      { href: '/guides', label: 'Open Guides', primary: true },
    ],
    '/backend/admin/team': [
      { href: '/about', label: 'Open Team Area', primary: true },
    ],
    '/backend/admin/course-reviews': [
      { href: '/course-reviews', label: 'Open Reviews', primary: true },
    ],
    '/backend/admin/job-success-stories': [
      { href: '/job-success-stories', label: 'Open Success Stories', primary: true },
    ],
    '/backend/admin/events': [
      { href: '/events', label: 'Open Events', primary: true },
    ],
    '/backend/admin/challenges': [
      { href: '/challenges', label: 'Open Challenges', primary: true },
    ],
    '/backend/admin/dashboard': [
      { href: '/', label: 'Open Website', primary: true },
      { href: '/courses', label: 'Open Courses' },
    ],
  };

  return map[path] || [];
}

function injectAdminCommandBar(root = document) {
  const content = root.querySelector('.dashboard-content');
  if (!content || content.querySelector('.admin-command-bar')) {
    return;
  }
  // Skip if the page already has its own KPI/analytics layout
  if (content.querySelector('.kpi-grid, .kpi-card, .ribbon')) {
    return;
  }

  const presentation = getAdminPagePresentation();
  const targets = getAdminFrontendTargets();
  const routeLinks = getAdminRouteLinks();
  const commandBar = document.createElement('section');
  commandBar.className = 'admin-command-bar';
  commandBar.innerHTML = `
    <div class="admin-command-card">
      <div class="admin-command-eyebrow">${presentation.kicker}</div>
      <div class="admin-command-title">${presentation.title}</div>
      <div class="admin-command-copy">${presentation.subtitle}</div>
      <div class="admin-command-actions">
        ${targets.map((target) => `<a class="admin-action-link${target.primary ? ' primary' : ''}" href="${target.href}" target="_blank" rel="noreferrer">${target.label}</a>`).join('')}
      </div>
      <div class="admin-command-metrics">
        <div class="admin-metric-pill">Operator-first controls</div>
        <div class="admin-metric-pill">Compact editing workflow</div>
        <div class="admin-metric-pill">Live page shortcuts</div>
      </div>
    </div>
    <div class="admin-route-grid">
      ${routeLinks.map((item) => `
        <div class="admin-route-card">
          <a class="admin-route-link" href="${item.href}">
            <div class="admin-route-name">${item.name}</div>
            <div class="admin-route-copy">${item.copy}</div>
            <div class="admin-route-meta">Open ${item.meta}</div>
          </a>
        </div>
      `).join('')}
    </div>
  `;

  content.insertBefore(commandBar, content.firstChild);
}

function summarizePanel(panel) {
  const inputCount = panel.querySelectorAll('input, select, textarea').length;
  const tableCount = panel.querySelectorAll('table').length;
  const buttonCount = panel.querySelectorAll('button').length;
  const parts = [];
  if (inputCount) {
    parts.push(`${inputCount} controls`);
  }
  if (tableCount) {
    parts.push(`${tableCount} table${tableCount === 1 ? '' : 's'}`);
  }
  if (buttonCount) {
    parts.push(`${buttonCount} actions`);
  }
  return parts.join(' · ') || 'Ready to manage';
}

function enhanceAdminPanels(root = document) {
  root.querySelectorAll('.dashboard-content .panel').forEach((panel, index) => {
    if (panel.dataset.adminPanelEnhanced === 'true') {
      return;
    }

    panel.dataset.adminPanelEnhanced = 'true';

    const titleNode = panel.querySelector('.table-title, .section-title, h2, h3');
    const form = panel.querySelector('form');
    const summary = document.createElement('div');
    summary.className = 'admin-panel-summary';
    summary.textContent = summarizePanel(panel);

    const actions = document.createElement('div');
    actions.className = 'admin-panel-actions';

    if (form) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'admin-panel-toggle';
      toggle.textContent = 'Hide editor';
      toggle.addEventListener('click', () => {
        const collapsed = panel.classList.toggle('admin-panel-collapsed');
        toggle.textContent = collapsed ? 'Open editor' : 'Hide editor';
      });
      actions.appendChild(toggle);

    }

    const firstTable = panel.querySelector('table');
    if (firstTable) {
      const openList = document.createElement('button');
      openList.type = 'button';
      openList.className = 'admin-panel-toggle';
      openList.textContent = 'Jump to table';
      openList.addEventListener('click', () => {
        firstTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      actions.appendChild(openList);
    }

    if (!actions.children.length) {
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'admin-panel-toolbar';
    toolbar.appendChild(summary);
    toolbar.appendChild(actions);

    const toolbarHost = panel.querySelector('.toolbar, .head') || titleNode?.parentElement || panel.firstElementChild || panel;
    if (toolbarHost && toolbarHost.parentElement === panel) {
      toolbarHost.insertAdjacentElement('afterend', toolbar);
    } else {
      panel.insertBefore(toolbar, panel.firstChild);
    }
  });
}

function enhanceEditorSections(root = document) {
  root.querySelectorAll('.editor .section').forEach((section) => {
    if (section.dataset.adminSectionEnhanced === 'true') {
      return;
    }

    section.dataset.adminSectionEnhanced = 'true';
    section.classList.add('admin-editor-section');
    const heading = section.querySelector('h3');
    if (!heading) {
      return;
    }

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'admin-section-head';

    const headingWrap = document.createElement('div');
    headingWrap.className = 'admin-section-heading';

    const count = document.createElement('span');
    count.className = 'admin-section-count';
    count.textContent = `${section.querySelectorAll('input, select, textarea').length} fields`;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'admin-section-toggle';
    toggle.textContent = 'Compact';

    heading.parentElement.insertBefore(sectionHeader, heading);
    headingWrap.appendChild(heading);
    headingWrap.appendChild(count);
    sectionHeader.appendChild(headingWrap);
    sectionHeader.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const compact = section.classList.toggle('is-compact');
      toggle.textContent = compact ? 'Expand' : 'Compact';
    });
  });
}

function injectDashboardModules(root = document) {
  if (window.location.pathname !== '/backend/admin/dashboard') {
    return;
  }

  const content = root.querySelector('.dashboard-content');
  if (!content || content.querySelector('.admin-dashboard-grid')) {
    return;
  }

  const modules = [
    { kicker: 'Content', title: 'Website Publishing', copy: 'Home content, blogs, guides, and free course funnels.', href: '/backend/admin/home-content', secondaryHref: '/backend/admin/blogs' },
    { kicker: 'Learning', title: 'Catalog Operations', copy: 'Courses, pricing, mentors, curriculum, and learner tracking.', href: '/backend/admin/courses', secondaryHref: '/courses' },
    { kicker: 'Brand', title: 'Trust and Growth', copy: 'Hiring partners, reviews, success stories, team, and events.', href: '/backend/admin/hiring-partners', secondaryHref: '/backend/admin/events' },
  ];

  const grid = document.createElement('section');
  grid.className = 'admin-dashboard-grid';
  grid.innerHTML = modules.map((module) => `
    <div class="admin-dashboard-module">
      <div class="admin-dashboard-kicker">${module.kicker}</div>
      <div class="admin-dashboard-title">${module.title}</div>
      <div class="admin-dashboard-copy">${module.copy}</div>
      <div class="admin-dashboard-actions">
        <a class="admin-action-link primary" href="${module.href}">Open admin</a>
        <a class="admin-action-link" href="${module.secondaryHref}">Open section</a>
      </div>
    </div>
  `).join('');

  const statsGrid = content.querySelector('.stats-grid, .stats');
  if (statsGrid) {
    statsGrid.insertAdjacentElement('afterend', grid);
  } else {
    content.insertBefore(grid, content.firstChild);
  }
}

function getAdminSectionViewConfig() {
  return {
    blogs: {
      default: { formIds: ['blogForm'], listIds: ['blogRows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
    challenges: {
      default: { formIds: ['challengeForm'], listIds: ['rows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
    courses: {
      default: { formIds: ['courseForm'], listIds: ['courseBody'] },
      categories: { formIds: ['catForm'], listIds: ['catBody'] },
      subcategories: { formIds: ['subcategoryForm'], listIds: ['subcategoryRows'] },
    },
    'course-reviews': {
      default: { formIds: ['reviewForm'], listIds: ['reviewRows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
    events: {
      default: { formIds: ['eventForm'], listIds: ['eventRows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
    guides: {
      default: { formIds: ['guideForm', 'itemForm'], listIds: ['rows'] },
    },
    'hiring-partners': {
      default: { formIds: ['partnerForm'], listIds: ['partnerRows'] },
    },
    'home-content': {
      default: { formIds: ['heroForm', 'statsForm', 'faqForm', 'testimonialForm'], listIds: ['faqRows', 'testimonialRows'] },
    },
    instructors: {
      default: { formIds: ['instructorForm'], listIds: ['instructorRows'] },
    },
    'job-success-stories': {
      default: { formIds: ['storyForm'], listIds: ['storyRows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
    team: {
      default: { formIds: ['teamForm'], listIds: ['membersGrid'] },
    },
    tutorials: {
      default: { formIds: ['itemForm'], listIds: ['rows'] },
      categories: { formIds: ['categoryForm'], listIds: ['categoryList'] },
    },
  };
}

function getPanelFromTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  return target.closest('section.panel, .panel, .cardx, .card, .table-container, .stack > section, .split > div');
}

function setPanelVisible(panel, visible) {
  if (!panel) {
    return;
  }
  panel.hidden = !visible;
  panel.style.display = visible ? '' : 'none';
}

function setElementVisible(element, visible) {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  element.hidden = !visible;
  element.style.display = visible ? '' : 'none';
}

function applyAdminViewRouting(root = document) {
  const route = getAdminRouteMeta();
  const sectionConfig = getAdminSectionViewConfig()[route.section];
  if (!sectionConfig) {
    return;
  }

  const viewConfig = route.subsection && sectionConfig[route.subsection]
    ? sectionConfig[route.subsection]
    : sectionConfig.default;

  if (!viewConfig) {
    return;
  }

  const formElements = (viewConfig.formIds || [])
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const listElements = (viewConfig.listIds || [])
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const siblingElements = Object.entries(sectionConfig)
    .filter(([key]) => {
      if (key === 'default' && !route.subsection) return false;
      if (key === route.subsection) return false;
      if (key === 'default' && route.subsection) return true;
      return key !== 'default';
    })
    .flatMap(([, config]) => [...(config.formIds || []), ...(config.listIds || [])])
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const formPanels = [...new Set(formElements.map((element) => getPanelFromTarget(element)).filter(Boolean))];
  const listPanels = [...new Set(listElements.map((element) => getPanelFromTarget(element)).filter(Boolean))];
  const siblingPanels = [...new Set(siblingElements.map((element) => getPanelFromTarget(element)).filter(Boolean))];

  siblingElements.forEach((element) => setElementVisible(element, false));
  siblingPanels.forEach((panel) => {
    if (!formPanels.includes(panel) && !listPanels.includes(panel)) {
      setPanelVisible(panel, false);
    }
  });

  if (route.mode === 'list') {
    formElements.forEach((element) => setElementVisible(element, false));
    listElements.forEach((element) => setElementVisible(element, true));
    formPanels.forEach((panel) => {
      if (!listPanels.includes(panel)) {
        setPanelVisible(panel, false);
      }
    });
    listPanels.forEach((panel) => setPanelVisible(panel, true));
    return;
  }

  formElements.forEach((element) => setElementVisible(element, true));
  listElements.forEach((element) => setElementVisible(element, false));
  formPanels.forEach((panel) => setPanelVisible(panel, true));
  listPanels.forEach((panel) => {
    if (!formPanels.includes(panel)) {
      setPanelVisible(panel, false);
    }
  });

  if (route.mode === 'edit') {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      return;
    }

    window.requestAnimationFrame(() => {
      try {
        if (route.section === 'courses' && route.subsection === 'categories' && typeof window.catEdit === 'function') {
          window.catEdit(id);
          return;
        }

        if (route.subsection === 'categories' && typeof window.editCategory === 'function') {
          window.editCategory(id);
          return;
        }

        if (typeof window.startEdit === 'function') {
          window.startEdit(id);
        } else if (route.section === 'courses' && typeof window.editCourse === 'function') {
          window.editCourse(id);
        }
      } catch (error) {
        console.error('Failed to open edit view:', error);
      }
    });
  }
}

function injectAdminModeActions(root = document) {
  const topBarRight = root.querySelector('.top-bar-right');
  if (!topBarRight) {
    return;
  }

  const route = getAdminRouteMeta();
  if (route.section === 'dashboard') {
    return;
  }

  let actionLink = topBarRight.querySelector('.admin-mode-link');
  if (!actionLink) {
    actionLink = document.createElement('a');
    actionLink.className = 'admin-mode-link btn btn-primary';
    topBarRight.insertBefore(actionLink, topBarRight.firstChild);
  }

  const basePath = `/backend/admin/${route.section}${route.subsection ? `/${route.subsection}` : ''}`;
  if (route.mode === 'list') {
    actionLink.href = `${basePath}/new`;
    actionLink.textContent =
      route.section === 'course-reviews' && !route.subsection
        ? 'Add Review'
        : route.section === 'tutorials' && !route.subsection
          ? 'Add Free Course'
        : route.subsection === 'categories'
          ? 'Add Category'
          : route.subsection === 'subcategories'
            ? 'Add Sub Category'
            : 'Add New';
  } else {
    actionLink.href = basePath;
    actionLink.textContent = 'Back to List';
  }
}

function interceptAdminCrudButtons(root = document) {
  const body = root.body;
  if (!body || body.dataset.crudInterceptBound === 'true') {
    return;
  }

  body.dataset.crudInterceptBound = 'true';

  root.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('button, a') : null;
    if (!target) {
      return;
    }

    const route = getAdminRouteMeta();
    if (!route.section || route.section === 'dashboard') {
      return;
    }

    const text = (target.textContent || '').trim().toLowerCase();
    const onclickText = target.getAttribute('onclick') || '';
    const basePath = `/backend/admin/${route.section}${route.subsection ? `/${route.subsection}` : ''}`;

    if (route.mode === 'list' && (/^(add|create)\b/.test(text) || /showAddModal|courseNew\(|catReset\(/.test(onclickText))) {
      event.preventDefault();
      window.location.href = `${basePath}/new`;
      return;
    }

    if (route.mode === 'list' && /^edit\b/.test(text)) {
      const match = onclickText.match(/(?:startEdit|editCourse|catEdit|editCategory)\('([^']+)'\)/);
      if (match && match[1]) {
        event.preventDefault();
        window.location.href = `${basePath}/edit?id=${encodeURIComponent(match[1])}`;
      }
    }
  });
}

function enhanceAdminDataTables(root = document) {
  const tableListTargets = new Set(
    Object.values(getAdminSectionViewConfig())
      .flatMap((sectionConfig) => Object.values(sectionConfig))
      .flatMap((config) => config.listIds || [])
  );

  root.querySelectorAll('table').forEach((table) => {
    if (table.dataset.adminDatatable === 'true') {
      return;
    }

    const tbody = table.tBodies && table.tBodies[0];
    const headers = Array.from(table.querySelectorAll('thead th'));
    const tbodyId = tbody?.id || '';
    const containsInlineControls = Boolean(
      table.querySelector('input, select, textarea')
    );

    if (
      !tbody ||
      headers.length < 2 ||
      !tableListTargets.has(tbodyId) ||
      containsInlineControls
    ) {
      return;
    }

    table.dataset.adminDatatable = 'true';

    const container = document.createElement('div');
    container.className = 'admin-datatable';

    const controls = document.createElement('div');
    controls.className = 'admin-datatable-controls';
    controls.innerHTML = `
      <input class="admin-datatable-search" type="search" placeholder="Search table" />
      <div class="admin-datatable-actions">
        <select class="admin-datatable-size">
          <option value="10">10 rows</option>
          <option value="25">25 rows</option>
          <option value="50">50 rows</option>
          <option value="100">100 rows</option>
        </select>
        <button type="button" class="btn">Export CSV</button>
        <button type="button" class="btn">Export JSON</button>
      </div>
    `;

    const filters = document.createElement('div');
    filters.className = 'admin-datatable-filters';

    const pager = document.createElement('div');
    pager.className = 'admin-datatable-pager';

    const wrapper = table.parentElement;
    if (!wrapper || !wrapper.parentElement) {
      return;
    }

    wrapper.parentElement.insertBefore(container, wrapper);
    container.appendChild(controls);
    container.appendChild(filters);
    container.appendChild(wrapper);
    container.appendChild(pager);

    const searchInput = controls.querySelector('.admin-datatable-search');
    const sizeSelect = controls.querySelector('.admin-datatable-size');
    const exportButtons = controls.querySelectorAll('.admin-datatable-actions .btn');
    const state = { query: '', page: 1, pageSize: 10, filters: {} };

    function getRows() {
      return Array.from(tbody.querySelectorAll('tr')).filter((row) => !row.dataset.adminDatatableEmpty);
    }

    function getCells(row) {
      return Array.from(row.children).map((cell) => (cell.textContent || '').trim());
    }

    function getMatchedRows() {
      const query = state.query.toLowerCase();
      return getRows().filter((row) => {
        const cells = getCells(row);
        const haystack = cells.join(' ').toLowerCase();
        const queryOk = !query || haystack.includes(query);
        const filtersOk = Object.entries(state.filters).every(([index, value]) => {
          if (!value) return true;
          return (cells[Number(index)] || '') === value;
        });
        return queryOk && filtersOk;
      });
    }

    function renderFilters() {
      filters.innerHTML = '';
      headers.forEach((header, index) => {
        const values = [...new Set(getRows().map((row) => getCells(row)[index] || '').filter(Boolean))];
        if (values.length < 2 || values.length > 12) {
          return;
        }

        const select = document.createElement('select');
        select.className = 'admin-datatable-filter';
        select.innerHTML = `<option value="">All ${header.textContent.trim()}</option>${values.map((value) => `<option value="${value.replace(/"/g, '&quot;')}">${value}</option>`).join('')}`;
        select.value = state.filters[index] || '';
        select.addEventListener('change', () => {
          state.filters[index] = select.value;
          state.page = 1;
          render();
        });
        filters.appendChild(select);
      });
    }

    function renderPager(total) {
      const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
      state.page = Math.min(state.page, totalPages);
      pager.innerHTML = `
        <div class="admin-datatable-summary">Showing ${total ? ((state.page - 1) * state.pageSize) + 1 : 0} to ${Math.min(state.page * state.pageSize, total)} of ${total}</div>
        <div class="admin-datatable-page-actions">
          <button type="button" class="btn" ${state.page <= 1 ? 'disabled' : ''}>Previous</button>
          <span class="admin-datatable-page-chip">Page ${state.page} of ${totalPages}</span>
          <button type="button" class="btn" ${state.page >= totalPages ? 'disabled' : ''}>Next</button>
        </div>
      `;
      const buttons = pager.querySelectorAll('.btn');
      if (buttons[0]) buttons[0].addEventListener('click', () => { state.page -= 1; render(); });
      if (buttons[1]) buttons[1].addEventListener('click', () => { state.page += 1; render(); });
    }

    function ensureEmptyRow() {
      let emptyRow = tbody.querySelector('tr[data-admin-datatable-empty="true"]');
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.dataset.adminDatatableEmpty = 'true';
        emptyRow.innerHTML = `<td colspan="${headers.length}" class="hint">No matching rows found.</td>`;
        tbody.appendChild(emptyRow);
      }
      return emptyRow;
    }

    function render() {
      const rows = getRows();
      const matched = getMatchedRows();
      const start = (state.page - 1) * state.pageSize;
      const end = start + state.pageSize;

      rows.forEach((row) => { row.style.display = 'none'; });
      matched.slice(start, end).forEach((row) => { row.style.display = ''; });

      const emptyRow = ensureEmptyRow();
      emptyRow.style.display = matched.length ? 'none' : '';

      renderPager(matched.length);
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.query = searchInput.value.trim();
        state.page = 1;
        render();
      });
    }

    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        state.pageSize = Number(sizeSelect.value || 10);
        state.page = 1;
        render();
      });
    }

    if (exportButtons[0]) {
      exportButtons[0].addEventListener('click', () => {
        const csv = [headers.map((header) => `"${header.textContent.trim().replace(/"/g, '""')}"`).join(',')]
          .concat(getMatchedRows().map((row) => getCells(row).map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'admin-table.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }

    if (exportButtons[1]) {
      exportButtons[1].addEventListener('click', () => {
        const json = getMatchedRows().map((row) => {
          const cells = getCells(row);
          return Object.fromEntries(headers.map((header, index) => [header.textContent.trim(), cells[index] || '']));
        });
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'admin-table.json';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }

    const observer = new MutationObserver(() => {
      renderFilters();
      render();
    });
    observer.observe(tbody, { childList: true, subtree: true });

    renderFilters();
    render();
  });
}

let adminUiEnhancementsQueued = false;

function runAdminUiEnhancements() {
  adminUiEnhancementsQueued = false;
  decorateAdminNavigation(document);
  applyAdminViewRouting(document);
  interceptAdminCrudButtons(document);
  enhanceAdminTopBar(document);
  initResponsiveAdminShell();
  injectAdminModeActions(document);
  enhanceAdminPanels(document);
  enhanceEditorSections(document);
  enhanceAdminForms(document);
  initAdminRichTextEditors(document);
  normalizeAdminCopy(document);
  enhanceReorderButtons(document);
  enhanceAdminDataTables(document);
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
    const shouldQueue = mutations.some((mutation) => {
      if (mutation.type !== 'childList' || !mutation.addedNodes.length) {
        return false;
      }

      return [...mutation.addedNodes].some((node) => {
        if (!(node instanceof HTMLElement)) {
          return false;
        }

        if (node.closest('.cke, .ck, .admin-rich-editor')) {
          return false;
        }

        return true;
      });
    });

    if (shouldQueue) {
      queueAdminUiEnhancements();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

checkAuth();
initResponsiveAdminShell();
initAdminUiEnhancements();
