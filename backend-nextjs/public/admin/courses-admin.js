const S = { courses: [], cats: [], pay: null, selected: '' };

const byId = (id) => document.getElementById(id);
const lines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
const esc = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const attr = (value) => esc(value).replaceAll('`', '&#96;');
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const INLINE_DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.txt,.ppt,.pptx,.zip,.rar,.csv,.xlsx,.xls,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
const INLINE_VIDEO_ACCEPT = 'video/*,.mp4,.m4v,.mov,.webm,.avi,.mkv';
const INLINE_UPLOAD_LIMIT_BYTES = 8 * 1024 * 1024;

function isDataUrl(value) {
  return /^data:/i.test(String(value || '').trim());
}

function inferAssetSourceFromValue(value, fallback = 'link') {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return fallback;
  return isDataUrl(normalizedValue) ? 'upload' : 'link';
}

function getCurriculumAssetValue(row = {}) {
  return String(row.resourceUrl || row.videoUrl || '').trim();
}

function getCurriculumAssetLabel(row = {}) {
  return String(row.assetLabel || row.assetName || '').trim();
}

function createSuggestedRoomName(value) {
  return slugify(value || '') || `edvo-room-${Date.now().toString().slice(-6)}`;
}

function getLaunchPath(roomName) {
  return `/live-classroom/${encodeURIComponent(roomName || 'room-name')}`;
}

function buildLiveLaunchUrl(session = {}, entry = 'student') {
  const roomName = String(session.roomName || '').trim() || createSuggestedRoomName(session.title || 'live-room');
  const launchUrl = new URL(getLaunchPath(roomName), window.location.origin);
  launchUrl.searchParams.set('entry', entry === 'host' ? 'host' : 'student');
  if (session.title) launchUrl.searchParams.set('title', session.title);
  if (session.hostName) launchUrl.searchParams.set('host', session.hostName);
  if (session.startTime) launchUrl.searchParams.set('start', session.startTime);
  if (session.recordingUrl) launchUrl.searchParams.set('recordingUrl', session.recordingUrl);
  return launchUrl.toString();
}

function syncCurriculumAssetUi(row) {
  if (!row) return;

  const contentTypeField = row.querySelector('[data-k="contentType"]');
  const assetSourceField = row.querySelector('[data-k="assetSource"]');
  const linkField = row.querySelector('[data-k="assetLink"]');
  const fileField = row.querySelector('[data-k="assetFile"]');
  const metaField = row.querySelector('[data-k="assetMeta"]');
  const linkWrap = row.querySelector('[data-role="asset-link"]');
  const fileWrap = row.querySelector('[data-role="asset-file"]');

  if (!contentTypeField || !assetSourceField || !linkField || !fileField || !metaField || !linkWrap || !fileWrap) return;

  const contentType = String(contentTypeField.value || 'recorded').toLowerCase();
  const assetSource = assetSourceField.value === 'upload' ? 'upload' : 'link';
  const assetKind = contentType === 'recorded' ? 'video' : 'resource';
  const storedLabel = String(row.dataset.assetLabel || '').trim();
  const storedValue = String(row.dataset.assetValue || '').trim();

  if (contentType === 'live') {
    assetSourceField.value = 'link';
    assetSourceField.disabled = true;
    linkField.disabled = true;
    fileField.disabled = true;
    linkWrap.hidden = true;
    fileWrap.hidden = true;
    metaField.className = 'upload-meta warn';
    metaField.textContent = 'Live rows do not use direct assets. Configure the live room, host URL, and schedule in the Live Sessions section below.';
    return;
  }

  assetSourceField.disabled = false;
  linkField.disabled = false;
  fileField.disabled = false;
  linkWrap.hidden = assetSource !== 'link';
  fileWrap.hidden = assetSource !== 'upload';
  fileField.accept = assetKind === 'video' ? INLINE_VIDEO_ACCEPT : INLINE_DOCUMENT_ACCEPT;
  linkField.placeholder = assetKind === 'video' ? 'Paste hosted video URL' : 'Paste resource or download URL';

  if (assetSource === 'upload') {
    metaField.className = storedValue ? 'upload-meta ready' : 'upload-meta';
    metaField.textContent = storedValue
      ? `${storedLabel || `Uploaded ${assetKind}`} saved inline. Use link mode for large files.`
      : `Upload a ${assetKind} file here. For large files, switch to link mode.`;
  } else {
    metaField.className = 'upload-meta';
    metaField.textContent = assetKind === 'video'
      ? 'Link mode is best for full course videos hosted on Drive, Vimeo, YouTube, or your CDN.'
      : 'Link mode is best for PDFs, notes, and other hosted resources.';
  }
}

function handleCurriculumFileChange(input) {
  const row = input.closest('tr');
  const file = input.files && input.files[0];
  if (!row || !file) return;

  if (file.size > INLINE_UPLOAD_LIMIT_BYTES) {
    input.value = '';
    showToast('Uploads above 8 MB should use link mode to avoid save failures.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      row.dataset.assetValue = reader.result;
      row.dataset.assetLabel = file.name;
      syncCurriculumAssetUi(row);
      showToast(`${file.name} attached`, 'success');
    }
  };
  reader.onerror = () => {
    input.value = '';
    showToast('Unable to read the selected file', 'error');
  };
  reader.readAsDataURL(file);
}

function collectSessionRow(row) {
  const title = row.querySelector('[data-k="title"]').value.trim();
  const startTime = row.querySelector('[data-k="startTime"]').value.trim();
  const endTime = row.querySelector('[data-k="endTime"]').value.trim();
  const hostName = row.querySelector('[data-k="hostName"]').value.trim();
  const roomName = row.querySelector('[data-k="roomName"]').value.trim() || createSuggestedRoomName(title || 'live-room');
  const recordingUrl = row.querySelector('[data-k="recordingUrl"]').value.trim();

  return {
    title,
    startTime,
    endTime,
    hostName,
    roomName,
    meetingUrl: buildLiveLaunchUrl({ title, startTime, endTime, hostName, roomName, recordingUrl }, 'student'),
    recordingUrl,
    status: row.querySelector('[data-k="status"]').value,
  };
}

function refreshSessionRow(row) {
  if (!row) return;

  const session = collectSessionRow(row);
  const roomField = row.querySelector('[data-k="roomName"]');
  const titleField = row.querySelector('[data-k="title"]');
  const meetingField = row.querySelector('[data-k="meetingUrl"]');
  const noteField = row.querySelector('[data-k="launchNote"]');
  const hostLaunchUrl = buildLiveLaunchUrl(session, 'host');

  if (!roomField || !titleField || !meetingField || !noteField) return;

  roomField.placeholder = createSuggestedRoomName(titleField.value.trim() || 'live-room');
  meetingField.value = session.meetingUrl;
  meetingField.readOnly = true;
  noteField.textContent = `Student ${session.meetingUrl}\nHost ${hostLaunchUrl}`;
}

function startLiveSession(button) {
  const row = button.closest('tr');
  if (!row) return;

  const roomField = row.querySelector('[data-k="roomName"]');
  if (roomField && !roomField.value.trim()) {
    roomField.value = createSuggestedRoomName(row.querySelector('[data-k="title"]').value.trim() || 'live-room');
  }

  refreshSessionRow(row);
  const session = collectSessionRow(row);
  window.open(buildLiveLaunchUrl(session, 'host'), '_blank', 'noopener,noreferrer');
  showToast('Host live room opened. Share the student launch link with learners.', 'success');
}

async function copyLiveLaunch(button) {
  const row = button.closest('tr');
  if (!row) return;

  const roomField = row.querySelector('[data-k="roomName"]');
  if (roomField && !roomField.value.trim()) {
    roomField.value = createSuggestedRoomName(row.querySelector('[data-k="title"]').value.trim() || 'live-room');
  }

  refreshSessionRow(row);
  const launchUrl = buildLiveLaunchUrl(collectSessionRow(row), 'student');

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(launchUrl);
      showToast('Student launch URL copied', 'success');
      return;
    }
  } catch (error) {
    console.error(error);
  }

  window.prompt('Copy this student launch URL', launchUrl);
}

function filterRows() {
  const query = byId('q').value.trim().toLowerCase();
  const status = byId('fStatus').value;
  const mode = byId('fMode').value;
  return S.courses.filter((course) => {
    const haystack = [course.title, course.category, course.instructorName, course.shortDescription].join(' ').toLowerCase();
    return (!query || haystack.includes(query)) && (!status || course.status === status) && (!mode || (course.deliveryMode || '').toLowerCase() === mode);
  });
}

function tag(mode) {
  const normalized = String(mode || 'recorded').toLowerCase();
  return normalized === 'live' ? 'live' : normalized === 'hybrid' ? 'hybrid' : 'recorded';
}

function swapInArray(items, fromIndex, toIndex) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function moveRow(button, direction) {
  const row = button.closest('tr');
  if (!row || !row.parentElement) return;
  const sibling = direction < 0 ? row.previousElementSibling : row.nextElementSibling;
  if (!sibling) return;
  if (direction < 0) row.parentElement.insertBefore(row, sibling);
  else row.parentElement.insertBefore(sibling, row);
}

function removeRow(button) {
  const row = button.closest('tr');
  if (row) row.remove();
}

function shuffleRows(bodyId) {
  const body = byId(bodyId);
  if (!body) return;
  [...body.querySelectorAll('tr')].sort(() => Math.random() - 0.5).forEach((row) => body.appendChild(row));
  showToast('Section order shuffled', 'success');
}

function rowControls() {
  return "<div class='acts'><button class='btn' type='button' onclick='moveRow(this,-1)'>Up</button><button class='btn' type='button' onclick='moveRow(this,1)'>Down</button><button class='btn' type='button' onclick='removeRow(this)'>Delete</button></div>";
}

byId('q').addEventListener('input', renderCourses);
byId('fStatus').addEventListener('change', renderCourses);
byId('fMode').addEventListener('change', renderCourses);
byId('payForm').addEventListener('submit', savePay);
byId('catForm').addEventListener('submit', saveCat);
byId('courseForm').addEventListener('submit', saveCourse);
byId('catName').addEventListener('blur', () => { if (!byId('catSlug').value.trim()) byId('catSlug').value = slugify(byId('catName').value); });
byId('cTitle').addEventListener('blur', () => { if (!byId('cSlug').value.trim()) byId('cSlug').value = slugify(byId('cTitle').value); });

async function fetchCatalogData() {
  const [coursesPayload, categoriesPayload] = await Promise.all([
    adminFetch('/backend/api/admin/courses'),
    adminFetch('/backend/api/admin/course-categories'),
  ]);
  return { coursesPayload, categoriesPayload };
}

function applyCatalogData(coursesPayload, categoriesPayload) {
  S.courses = (coursesPayload.data.courses || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  S.cats = (categoriesPayload.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function boot() {
  try {
    const [{ coursesPayload, categoriesPayload }, paymentPayload] = await Promise.all([
      fetchCatalogData(),
      adminFetch('/backend/api/admin/payment-settings').catch(() => ({ data: {} })),
    ]);

    applyCatalogData(coursesPayload, categoriesPayload);

    if (!S.courses.length || !S.cats.length) {
      try {
        const importPayload = await adminFetch('/backend/api/admin/courses/import-legacy', { method: 'POST' });
        const imported = importPayload.data || {};
        if ((imported.createdCourses || 0) > 0 || (imported.createdCategories || 0) > 0) {
          showToast('Earlier courses and categories added to admin', 'success');
        }
        const refreshed = await fetchCatalogData();
        applyCatalogData(refreshed.coursesPayload, refreshed.categoriesPayload);
      } catch (importError) {
        console.error(importError);
      }
    }

    S.pay = paymentPayload.data || {};
    renderSummary();
    renderCatOptions();
    renderCats();
    renderCourses();
    fillPay();
    S.courses.length ? editCourse(S.courses[0].id) : courseNew();
  } catch (error) {
    showToast(error.message || 'Unable to load course control center', 'error');
  }
}

function renderSummary() {
  const learners = S.courses.reduce((total, course) => total + (course.studentMetrics?.totalStudents || 0), 0);
  const live = S.courses.filter((course) => (course.deliveryMode || '').toLowerCase() === 'live').length;
  const avg = S.courses.length ? Math.round(S.courses.reduce((sum, course) => sum + (course.studentMetrics?.averageProgress || 0), 0) / S.courses.length) : 0;
  const careerMatches = S.courses.reduce((total, course) => total + (course.careerPaths?.length || 0), 0);
  byId('sum').innerHTML = [
    ['Total Courses', S.courses.length, 'Legacy imports plus new admin-created courses now live here.'],
    ['Categories', S.cats.length, 'Dropdowns and filters are controlled by admin-managed category order.'],
    ['Total Learners', learners, 'Paid enrollments unlock the student dashboard automatically.'],
    ['Live Cohorts', live, 'Recorded, live, and hybrid formats are controlled per course.'],
    ['Avg Progress', avg + '%', 'Attendance, performance, and participation surface in admin and student views.'],
    ['Career Matches', careerMatches, 'Admin-set job and role cards flow into each student dashboard by course.'],
  ].map((item) => `<article class='cardx'><small>${item[0]}</small><strong>${item[1]}</strong><span>${item[2]}</span></article>`).join('');
}

function fillPay() {
  const payment = S.pay || {};
  byId('payActive').value = String(Boolean(payment.active));
  byId('payMode').value = String(payment.testMode !== false);
  byId('payKeyId').value = payment.keyId || '';
  byId('payKeySecret').value = payment.keySecret || '';
  byId('payCurrency').value = payment.currency || 'INR';
  byId('payTheme').value = payment.themeColor || '#c17017';
  byId('payCompany').value = payment.companyName || 'EDVO';
  byId('paySupport').value = payment.supportEmail || 'support@edvo.com';
}

async function savePay(event) {
  event.preventDefault();
  try {
    const response = await adminFetch('/backend/api/admin/payment-settings', {
      method: 'PATCH',
      body: JSON.stringify({
        active: byId('payActive').value === 'true',
        testMode: byId('payMode').value === 'true',
        keyId: byId('payKeyId').value.trim(),
        keySecret: byId('payKeySecret').value.trim(),
        currency: byId('payCurrency').value.trim() || 'INR',
        themeColor: byId('payTheme').value.trim() || '#c17017',
        companyName: byId('payCompany').value.trim() || 'EDVO',
        supportEmail: byId('paySupport').value.trim() || 'support@edvo.com',
      }),
    });
    S.pay = response.data;
    showToast('Payment settings saved', 'success');
  } catch (error) {
    showToast(error.message || 'Unable to save payment settings', 'error');
  }
}

function renderCatOptions() {
  byId('cCategory').innerHTML = "<option value=''>Select category</option>" + S.cats.map((category) => `<option value='${esc(category.name)}'>${esc(category.name)}</option>`).join('');
}

function renderCats() {
  byId('catBody').innerHTML = S.cats.length ? S.cats.map((category) => `
    <tr>
      <td><span class='order-chip'>${category.order || 0}</span></td>
      <td><span class='tt'>${esc(category.name)}</span><span class='ts'>${esc(category.description || '')}</span></td>
      <td>${esc(category.slug)}</td>
      <td><div class='acts'><button class='btn' type='button' onclick="catShift('${category.id}',-1)">Up</button><button class='btn' type='button' onclick="catShift('${category.id}',1)">Down</button><button class='btn' type='button' onclick="catEdit('${category.id}')">Edit</button><button class='btn' type='button' onclick="catDelete('${category.id}')">Delete</button></div></td>
    </tr>`).join('') : "<tr><td colspan='4' class='hint'>No categories yet. Create one here or use the legacy course import.</td></tr>";
}

async function catReload() {
  const payload = await adminFetch('/backend/api/admin/course-categories');
  S.cats = (payload.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  renderCatOptions();
  renderCats();
  renderSummary();
}

function catReset() {
  byId('catForm').reset();
  byId('catId').value = '';
  byId('catColor').value = '#c17017';
  byId('catOrder').value = String(S.cats.length + 1 || 1);
}

function catEdit(id) {
  const category = S.cats.find((item) => item.id === id);
  if (!category) return;
  byId('catId').value = category.id;
  byId('catName').value = category.name || '';
  byId('catSlug').value = category.slug || '';
  byId('catColor').value = category.color || '#c17017';
  byId('catOrder').value = category.order || 0;
  byId('catDesc').value = category.description || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function saveCat(event) {
  event.preventDefault();
  const id = byId('catId').value;
  try {
    await adminFetch(id ? `/backend/api/admin/course-categories/${id}` : '/backend/api/admin/course-categories', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify({
        name: byId('catName').value.trim(),
        slug: byId('catSlug').value.trim() || slugify(byId('catName').value),
        description: byId('catDesc').value.trim(),
        color: byId('catColor').value.trim() || '#c17017',
        order: Number(byId('catOrder').value || S.cats.length + 1),
        isActive: true,
      }),
    });
    showToast('Category saved', 'success');
    catReset();
    await catReload();
    await courseReload();
  } catch (error) {
    showToast(error.message || 'Unable to save category', 'error');
  }
}

async function persistCategoryOrder() {
  try {
    await Promise.all(S.cats.map((category, index) => adminFetch(`/backend/api/admin/course-categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ order: index + 1 }) })));
    await catReload();
    showToast('Category order updated', 'success');
  } catch (error) {
    showToast(error.message || 'Unable to reorder categories', 'error');
  }
}

async function catShift(id, direction) {
  const index = S.cats.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= S.cats.length) return;
  S.cats = swapInArray(S.cats, index, nextIndex).map((item, idx) => ({ ...item, order: idx + 1 }));
  renderCats();
  await persistCategoryOrder();
}

async function shuffleCategories() {
  if (S.cats.length < 2) return;
  S.cats = S.cats.slice().sort(() => Math.random() - 0.5).map((item, idx) => ({ ...item, order: idx + 1 }));
  renderCats();
  await persistCategoryOrder();
}

async function catDelete(id) {
  if (!confirm('Delete this category?')) return;
  try {
    await adminFetch(`/backend/api/admin/course-categories/${id}`, { method: 'DELETE' });
    showToast('Category deleted', 'success');
    await catReload();
    await courseReload();
  } catch (error) {
    showToast(error.message || 'Unable to delete category', 'error');
  }
}

function renderCourses() {
  const rows = filterRows();
  byId('courseBody').innerHTML = rows.length ? rows.map((course) => `
    <tr>
      <td><span class='order-chip'>${course.order || 0}</span></td>
      <td><span class='tt'>${esc(course.title)}</span><span class='ts'>${esc(course.shortDescription || course.description || '')}</span></td>
      <td><span class='tag ${tag(course.deliveryMode)}'>${esc(course.deliveryMode || 'recorded')}</span></td>
      <td>${esc(course.category || '-')}</td>
      <td>${course.studentMetrics?.totalStudents || 0}</td>
      <td>${course.studentMetrics?.averageProgress || 0}%</td>
      <td>${course.studentMetrics?.averageAttendance || 0}%</td>
      <td>${course.studentMetrics?.averagePerformance || 0}%</td>
      <td><div class='acts'><button class='btn' type='button' onclick="courseShift('${course.id}',-1)">Up</button><button class='btn' type='button' onclick="courseShift('${course.id}',1)">Down</button><button class='btn' type='button' onclick="editCourse('${course.id}')">Edit</button><button class='btn' type='button' onclick="courseDelete('${course.id}')">Delete</button></div></td>
    </tr>`).join('') : "<tr><td colspan='9' class='hint'>No courses available yet. Use Add Course or Import Earlier Courses.</td></tr>";
}

async function courseReload() {
  const payload = await adminFetch('/backend/api/admin/courses');
  S.courses = (payload.data.courses || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  renderSummary();
  renderCourses();
  const activeId = byId('courseId').value || S.selected;
  const current = S.courses.find((item) => item.id === activeId);
  if (current) editCourse(current.id);
  else if (S.courses.length) editCourse(S.courses[0].id);
  else courseNew();
}

async function persistCourseOrder() {
  try {
    await Promise.all(S.courses.map((course, index) => adminFetch(`/backend/api/admin/courses/${course.id}`, { method: 'PATCH', body: JSON.stringify({ order: index + 1 }) })));
    await courseReload();
    showToast('Course order updated', 'success');
  } catch (error) {
    showToast(error.message || 'Unable to reorder courses', 'error');
  }
}

async function courseShift(id, direction) {
  const filtered = filterRows();
  const index = filtered.findIndex((item) => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= filtered.length) return;
  const source = S.courses.findIndex((item) => item.id === filtered[index].id);
  const target = S.courses.findIndex((item) => item.id === filtered[nextIndex].id);
  S.courses = swapInArray(S.courses, source, target).map((item, idx) => ({ ...item, order: idx + 1 }));
  renderCourses();
  await persistCourseOrder();
}

async function shuffleCourses() {
  if (S.courses.length < 2) return;
  S.courses = S.courses.slice().sort(() => Math.random() - 0.5).map((item, idx) => ({ ...item, order: idx + 1 }));
  renderCourses();
  await persistCourseOrder();
}

async function importLegacyCourses() {
  if (!confirm('Import earlier EDVO courses into admin? Existing slugs will be skipped.')) return;
  try {
    const response = await adminFetch('/backend/api/admin/courses/import-legacy', { method: 'POST' });
    const data = response.data || {};
    showToast(`${data.createdCourses || 0} earlier courses added, ${data.skippedCourses || 0} already existed`, 'success');
    await catReload();
    await courseReload();
  } catch (error) {
    showToast(error.message || 'Unable to import earlier courses', 'error');
  }
}

function renderStudents(students) {
  byId('students').innerHTML = students.length ? students.map((student) => `
    <article class='student'>
      <strong>${esc(student.name || 'Student')}</strong>
      <div class='hint'>${esc(student.email || '')}</div>
      <span class='pill'>Progress ${student.progress || 0}%</span>
      <span class='pill'>Attendance ${student.attendance || 0}%</span>
      <span class='pill'>Performance ${student.performance || 0}%</span>
      <span class='pill'>Participation ${student.participation || 0}</span>
      <div class='hint' style='margin-top: 10px;'>Certificate ${student.certificateEligible ? 'ready' : 'in progress'} - Payment ${student.paymentStatus || 'paid'}</div>
    </article>`).join('') : "<div class='hint'>No learners enrolled in this course yet.</div>";
}

function courseReset() {
  byId('courseForm').reset();
  byId('courseId').value = '';
  S.selected = '';
  byId('cOrder').value = String(S.courses.length + 1 || 1);
  byId('cLanguage').value = 'English';
  byId('cMode').value = 'recorded';
  byId('cAccess').value = 12;
  byId('cJobAssist').value = 'true';
  byId('certOn').value = 'true';
  byId('certProg').value = 100;
  byId('certAttend').value = 70;
  byId('certPerf').value = 60;
  byId('notifEnroll').value = 'true';
  byId('notifLive').value = 'true';
  ['currBody', 'sessionBody', 'planBody', 'mentorBody', 'faqBody', 'testimonialBody', 'certBody', 'careerBody'].forEach((id) => { if (byId(id)) byId(id).innerHTML = ''; });
}

function ensureSectionRows() {
  if (!byId('currBody').children.length) addCurr();
  if (!byId('sessionBody').children.length) addSession();
  if (!byId('planBody').children.length) addPlan();
  if (!byId('mentorBody').children.length) addMentor();
  if (!byId('faqBody').children.length) addFaq();
  if (!byId('testimonialBody').children.length) addTestimonial();
  if (!byId('certBody').children.length) addCertification();
  if (byId('careerBody') && !byId('careerBody').children.length) addCareerPath();
}

function courseNew() {
  courseReset();
  byId('editorTitle').textContent = 'Create Course';
  byId('editorText').textContent = 'Create, edit, reorder, and manage the overview, offerings, career matches, curriculum, mentors, plans, certifications, testimonials, and FAQs for the restored course page.';
  ensureSectionRows();
  renderStudents([]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addCurr(row = {}) {
  const tr = document.createElement('tr');
  const assetValue = getCurriculumAssetValue(row);
  const assetSource = String(row.assetSource || inferAssetSourceFromValue(assetValue, 'link')).toLowerCase() === 'upload' ? 'upload' : 'link';

  tr.dataset.assetValue = assetSource === 'upload' ? assetValue : '';
  tr.dataset.assetLabel = getCurriculumAssetLabel(row);
  tr.innerHTML = `<td><input data-k='subject' value='${attr(row.subject || '')}'></td><td><input data-k='module' value='${attr(row.module || '')}'></td><td><input data-k='lecture' value='${attr(row.lecture || '')}'></td><td><input data-k='duration' value='${attr(row.duration || '')}'></td><td><select data-k='contentType' onchange='syncCurriculumAssetUi(this.closest("tr"))'><option value='recorded'>Recorded</option><option value='live'>Live</option><option value='resource'>Resource</option><option value='quiz'>Quiz</option></select></td><td><select data-k='isFree'><option value='false'>No</option><option value='true'>Yes</option></select></td><td><div class='asset-stack'><div data-role='asset-source'><select data-k='assetSource' onchange='syncCurriculumAssetUi(this.closest("tr"))'><option value='link'>Link</option><option value='upload'>Upload</option></select></div><div data-role='asset-link'><input data-k='assetLink' value='${attr(assetSource === 'link' ? assetValue : '')}'></div><div data-role='asset-file'><input data-k='assetFile' type='file'></div><div data-k='assetMeta' class='upload-meta'></div></div></td><td>${rowControls()}</td>`;
  byId('currBody').appendChild(tr);
  tr.querySelector('[data-k="contentType"]').value = row.contentType || 'recorded';
  tr.querySelector('[data-k="isFree"]').value = String(Boolean(row.isFree));
  tr.querySelector('[data-k="assetSource"]').value = assetSource;
  const assetFileInput = tr.querySelector('[data-k="assetFile"]');
  assetFileInput.addEventListener('change', () => handleCurriculumFileChange(assetFileInput));
  syncCurriculumAssetUi(tr);
}

function addSession(session = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='title' value='${attr(session.title || '')}'></td><td><input data-k='startTime' type='datetime-local' value='${attr(session.startTime || '')}'></td><td><input data-k='endTime' type='datetime-local' value='${attr(session.endTime || '')}'></td><td><input data-k='hostName' value='${attr(session.hostName || '')}'></td><td><div class='asset-stack'><input data-k='roomName' value='${attr(session.roomName || '')}' placeholder='edvo-room-001'><div data-k='launchNote' class='launch-note'></div><div class='acts'><button class='btn' type='button' onclick='startLiveSession(this)'>Start live</button><button class='btn' type='button' onclick='copyLiveLaunch(this)'>Copy launch</button></div></div></td><td><input data-k='meetingUrl' value='${attr(session.meetingUrl || '')}' placeholder='Generated from room name' readonly></td><td><select data-k='status'><option value='scheduled'>Scheduled</option><option value='live'>Live</option><option value='completed'>Completed</option><option value='cancelled'>Cancelled</option></select></td><td><input data-k='recordingUrl' value='${attr(session.recordingUrl || '')}'></td><td>${rowControls()}</td>`;
  byId('sessionBody').appendChild(tr);
  tr.querySelector('[data-k="status"]').value = session.status || 'scheduled';
  ['title', 'startTime', 'endTime', 'hostName', 'roomName', 'recordingUrl'].forEach((key) => {
    const field = tr.querySelector(`[data-k="${key}"]`);
    if (field) field.addEventListener('input', () => refreshSessionRow(tr));
  });
  refreshSessionRow(tr);
}

function addPlan(plan = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='name' value='${attr(plan.name || '')}'></td><td><input data-k='price' type='number' value='${attr(plan.price || '')}'></td><td><select data-k='isRecommended'><option value='false'>No</option><option value='true'>Yes</option></select></td><td><textarea data-k='features'>${esc(plan.features || '')}</textarea></td><td>${rowControls()}</td>`;
  byId('planBody').appendChild(tr);
  tr.querySelector('[data-k="isRecommended"]').value = String(Boolean(plan.isRecommended));
}

function addMentor(mentor = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='name' value='${attr(mentor.name || '')}'></td><td><input data-k='designation' value='${attr(mentor.designation || '')}'></td><td><input data-k='company' value='${attr(mentor.company || '')}'></td><td><input data-k='experience' value='${attr(mentor.experience || '')}'></td><td><input data-k='image' value='${attr(mentor.image || '')}'></td><td>${rowControls()}</td>`;
  byId('mentorBody').appendChild(tr);
}

function addFaq(faq = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='question' value='${attr(faq.question || '')}'></td><td><textarea data-k='answer'>${esc(faq.answer || '')}</textarea></td><td>${rowControls()}</td>`;
  byId('faqBody').appendChild(tr);
}

function addTestimonial(item = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='name' value='${attr(item.name || '')}'></td><td><input data-k='role' value='${attr(item.role || '')}'></td><td><input data-k='company' value='${attr(item.company || '')}'></td><td><input data-k='rating' type='number' min='1' max='5' value='${attr(item.rating || 5)}'></td><td><textarea data-k='quote'>${esc(item.quote || '')}</textarea></td><td>${rowControls()}</td>`;
  byId('testimonialBody').appendChild(tr);
}

function addCertification(item = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='name' value='${attr(item.name || '')}'></td><td><input data-k='provider' value='${attr(item.provider || '')}'></td><td>${rowControls()}</td>`;
  byId('certBody').appendChild(tr);
}

function addCareerPath(item = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='title' value='${attr(item.title || '')}'></td><td><input data-k='company' value='${attr(item.company || '')}'></td><td><input data-k='location' value='${attr(item.location || '')}'></td><td><select data-k='type'><option value=''>Select</option><option value='full-time'>Full-time</option><option value='part-time'>Part-time</option><option value='contract'>Contract</option><option value='internship'>Internship</option></select></td><td><select data-k='mode'><option value=''>Select</option><option value='remote'>Remote</option><option value='onsite'>Onsite</option><option value='hybrid'>Hybrid</option></select></td><td><input data-k='salary' value='${attr(item.salary || '')}'></td><td><input data-k='applicationUrl' value='${attr(item.applicationUrl || '')}'></td><td><input data-k='note' value='${attr(item.note || '')}'></td><td>${rowControls()}</td>`;
  byId('careerBody').appendChild(tr);
  tr.querySelector('[data-k="type"]').value = item.type || '';
  tr.querySelector('[data-k="mode"]').value = item.mode || '';
}

function editCourse(id) {
  const course = S.courses.find((item) => item.id === id);
  if (!course) return;
  S.selected = id;
  byId('editorTitle').textContent = `Edit ${course.title}`;
  byId('editorText').textContent = 'Frontend listing, restored single-course page, checkout, student dashboard, learner workspace, certificates, and career matches read these values.';
  byId('courseId').value = course.id || '';
  byId('cOrder').value = course.order || 1;
  byId('cTitle').value = course.title || '';
  byId('cSlug').value = course.slug || '';
  byId('cStatus').value = course.status || 'draft';
  byId('cCategory').value = course.category || '';
  byId('cLevel').value = course.level || 'beginner';
  byId('cInstructor').value = course.instructorName || '';
  byId('cMode').value = course.deliveryMode || 'recorded';
  byId('cJobAssist').value = String(course.jobAssistance !== false);
  byId('cLanguage').value = course.language || 'English';
  byId('cDuration').value = course.duration || '';
  byId('cStart').value = course.startDate || '';
  byId('cCohort').value = course.cohortLabel || '';
  byId('cAccess').value = course.accessDurationMonths || 12;
  byId('cPrice').value = course.price || 0;
  byId('cOriginal').value = course.originalPrice || 0;
  byId('cDiscount').value = course.discount || 0;
  byId('cThumb').value = course.thumbnail || '';
  byId('cBanner').value = course.banner || '';
  byId('cSupport').value = course.supportEmail || '';
  byId('cBannerTag').value = course.bannerTag || '';
  byId('cBannerSubtag').value = course.bannerSubtag || '';
  byId('cBannerExtra').value = course.bannerExtra || '';
  byId('cHiringPartners').value = course.stats?.hiringPartners || '';
  byId('cTransitions').value = course.stats?.careerTransitions || '';
  byId('cPackage').value = course.stats?.highestPackage || '';
  byId('cTags').value = (course.tags || []).join('\n');
  byId('cShort').value = course.shortDescription || '';
  byId('cDesc').value = course.description || '';
  byId('cLearn').value = (course.whatYouWillLearn || []).join('\n');
  byId('cReq').value = (course.requirements || []).join('\n');
  byId('cOutcomes').value = (course.featuredOutcomes || []).join('\n');
  byId('cOffer').value = (course.offerings || []).map((item) => item.title).join('\n');
  byId('certOn').value = String(course.certificateSettings?.enabled !== false);
  byId('certProg').value = course.certificateSettings?.minProgressPercentage || 100;
  byId('certAttend').value = course.certificateSettings?.minAttendancePercentage || 70;
  byId('certPerf').value = course.certificateSettings?.minPerformanceScore || 60;
  byId('notifEnroll').value = String(course.notificationSettings?.enrollmentConfirmation !== false);
  byId('notifLive').value = String(course.notificationSettings?.liveClassReminder !== false);
  byId('currBody').innerHTML = '';
  (course.curriculumRows || []).forEach(addCurr);
  byId('sessionBody').innerHTML = '';
  (course.liveSessions || []).forEach(addSession);
  byId('planBody').innerHTML = '';
  (course.plans || []).forEach((plan) => addPlan({ name: plan.name, price: plan.price, isRecommended: plan.isRecommended, features: Array.isArray(plan.features) ? plan.features.map((feature) => feature.value || feature.label || '').join('\n') : '' }));
  byId('mentorBody').innerHTML = '';
  (course.mentors || []).forEach(addMentor);
  byId('faqBody').innerHTML = '';
  (course.faqs || []).forEach(addFaq);
  byId('testimonialBody').innerHTML = '';
  (course.testimonials || []).forEach(addTestimonial);
  byId('certBody').innerHTML = '';
  (course.certifications || []).forEach(addCertification);
  if (byId('careerBody')) {
    byId('careerBody').innerHTML = '';
    (course.careerPaths || []).forEach(addCareerPath);
  }
  ensureSectionRows();
  renderStudents(course.students || []);
  window.scrollTo({ top: byId('editorTitle').getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

function readRows(bodyId, mapper) {
  return [...document.querySelectorAll(`#${bodyId} tr`)].map(mapper);
}

function payload() {
  return {
    order: Number(byId('cOrder').value || S.courses.length + 1),
    title: byId('cTitle').value.trim(),
    slug: byId('cSlug').value.trim(),
    status: byId('cStatus').value,
    category: byId('cCategory').value,
    level: byId('cLevel').value,
    instructorName: byId('cInstructor').value.trim(),
    deliveryMode: byId('cMode').value,
    jobAssistance: byId('cJobAssist').value === 'true',
    language: byId('cLanguage').value.trim(),
    duration: byId('cDuration').value.trim(),
    startDate: byId('cStart').value.trim(),
    cohortLabel: byId('cCohort').value.trim(),
    accessDurationMonths: Number(byId('cAccess').value || 12),
    price: Number(byId('cPrice').value || 0),
    originalPrice: Number(byId('cOriginal').value || 0),
    discount: Number(byId('cDiscount').value || 0),
    thumbnail: byId('cThumb').value.trim(),
    banner: byId('cBanner').value.trim(),
    supportEmail: byId('cSupport').value.trim(),
    bannerTag: byId('cBannerTag').value.trim(),
    bannerSubtag: byId('cBannerSubtag').value.trim(),
    bannerExtra: byId('cBannerExtra').value.trim(),
    stats: { hiringPartners: byId('cHiringPartners').value.trim(), careerTransitions: byId('cTransitions').value.trim(), highestPackage: byId('cPackage').value.trim() },
    tags: lines(byId('cTags').value),
    shortDescription: byId('cShort').value.trim(),
    description: byId('cDesc').value.trim(),
    whatYouWillLearn: lines(byId('cLearn').value),
    requirements: lines(byId('cReq').value),
    featuredOutcomes: lines(byId('cOutcomes').value),
    offerings: lines(byId('cOffer').value).map((title) => ({ icon: 'check', title })),
    careerPaths: byId('careerBody')
      ? readRows('careerBody', (row) => ({
          title: row.querySelector('[data-k="title"]').value.trim(),
          company: row.querySelector('[data-k="company"]').value.trim(),
          location: row.querySelector('[data-k="location"]').value.trim(),
          type: row.querySelector('[data-k="type"]').value.trim(),
          mode: row.querySelector('[data-k="mode"]').value.trim(),
          salary: row.querySelector('[data-k="salary"]').value.trim(),
          applicationUrl: row.querySelector('[data-k="applicationUrl"]').value.trim(),
          note: row.querySelector('[data-k="note"]').value.trim(),
        })).filter((item) => item.title || item.company || item.location || item.applicationUrl)
      : [],
    curriculumRows: readRows('currBody', (row) => {
      const contentType = row.querySelector('[data-k="contentType"]').value;
      const assetSource = row.querySelector('[data-k="assetSource"]').value === 'upload' ? 'upload' : 'link';
      const assetLink = row.querySelector('[data-k="assetLink"]').value.trim();
      const storedAsset = String(row.dataset.assetValue || '').trim();
      const assetValue = assetSource === 'upload' ? storedAsset : assetLink;
      const item = {
        subject: row.querySelector('[data-k="subject"]').value.trim(),
        module: row.querySelector('[data-k="module"]').value.trim(),
        lecture: row.querySelector('[data-k="lecture"]').value.trim(),
        duration: row.querySelector('[data-k="duration"]').value.trim(),
        contentType,
        isFree: row.querySelector('[data-k="isFree"]').value === 'true',
        assetSource,
        assetLabel: assetSource === 'upload' ? String(row.dataset.assetLabel || '').trim() : '',
        videoUrl: '',
        resourceUrl: '',
      };

      if (contentType === 'recorded') {
        item.videoUrl = assetValue;
      } else if (contentType === 'resource' || contentType === 'quiz') {
        item.resourceUrl = assetValue;
      }

      return item;
    }).filter((item) => item.subject && item.module && item.lecture),
    liveSessions: readRows('sessionBody', (row) => collectSessionRow(row)).filter((item) => item.title && item.startTime),
    plans: readRows('planBody', (row) => ({ name: row.querySelector('[data-k="name"]').value.trim(), price: Number(row.querySelector('[data-k="price"]').value || 0), isRecommended: row.querySelector('[data-k="isRecommended"]').value === 'true', features: lines(row.querySelector('[data-k="features"]').value).map((value, index) => ({ label: 'Feature ' + (index + 1), value })) })).filter((item) => item.name),
    mentors: readRows('mentorBody', (row) => ({ name: row.querySelector('[data-k="name"]').value.trim(), designation: row.querySelector('[data-k="designation"]').value.trim(), company: row.querySelector('[data-k="company"]').value.trim(), experience: row.querySelector('[data-k="experience"]').value.trim(), image: row.querySelector('[data-k="image"]').value.trim() })).filter((item) => item.name || item.designation || item.company),
    faqs: readRows('faqBody', (row) => ({ question: row.querySelector('[data-k="question"]').value.trim(), answer: row.querySelector('[data-k="answer"]').value.trim() })).filter((item) => item.question || item.answer),
    testimonials: readRows('testimonialBody', (row) => ({ name: row.querySelector('[data-k="name"]').value.trim(), role: row.querySelector('[data-k="role"]').value.trim(), company: row.querySelector('[data-k="company"]').value.trim(), rating: Number(row.querySelector('[data-k="rating"]').value || 5), quote: row.querySelector('[data-k="quote"]').value.trim() })).filter((item) => item.name || item.quote),
    certifications: readRows('certBody', (row) => ({ name: row.querySelector('[data-k="name"]').value.trim(), provider: row.querySelector('[data-k="provider"]').value.trim() })).filter((item) => item.name || item.provider),
    certificateSettings: { enabled: byId('certOn').value === 'true', minProgressPercentage: Number(byId('certProg').value || 100), minAttendancePercentage: Number(byId('certAttend').value || 70), minPerformanceScore: Number(byId('certPerf').value || 60) },
    notificationSettings: { enrollmentConfirmation: byId('notifEnroll').value === 'true', liveClassReminder: byId('notifLive').value === 'true', certificateIssued: true },
  };
}

async function saveCourse(event) {
  event.preventDefault();
  const id = byId('courseId').value;
  try {
    const response = await adminFetch(id ? `/backend/api/admin/courses/${id}` : '/backend/api/admin/courses', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload()) });
    S.selected = response.data?.id || id || '';
    showToast('Course saved', 'success');
    await courseReload();
  } catch (error) {
    showToast(error.message || 'Unable to save course', 'error');
  }
}

async function courseDelete(id) {
  if (!confirm('Delete this course and its enrollments?')) return;
  try {
    await adminFetch(`/backend/api/admin/courses/${id}`, { method: 'DELETE' });
    showToast('Course deleted', 'success');
    await courseReload();
  } catch (error) {
    showToast(error.message || 'Unable to delete course', 'error');
  }
}

boot();

