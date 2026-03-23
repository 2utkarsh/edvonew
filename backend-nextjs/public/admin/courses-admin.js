const S = { courses: [], cats: [], pay: null, selected: '' };

const byId = (id) => document.getElementById(id);
const lines = (value) => String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
const esc = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const attr = (value) => esc(value).replaceAll('`', '&#96;');
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

async function boot() {
  try {
    const [coursesPayload, categoriesPayload, paymentPayload] = await Promise.all([
      adminFetch('/backend/api/admin/courses'),
      adminFetch('/backend/api/admin/course-categories'),
      adminFetch('/backend/api/admin/payment-settings'),
    ]);
    S.courses = (coursesPayload.data.courses || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    S.cats = (categoriesPayload.data || []).sort((a, b) => (a.order || 0) - (b.order || 0));
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
  byId('sum').innerHTML = [
    ['Total Courses', S.courses.length, 'Legacy imports plus new admin-created courses now live here.'],
    ['Categories', S.cats.length, 'Dropdowns and filters are controlled by admin-managed category order.'],
    ['Total Learners', learners, 'Paid enrollments unlock the student dashboard automatically.'],
    ['Live Cohorts', live, 'Recorded, live, and hybrid formats are controlled per course.'],
    ['Avg Progress', avg + '%', 'Attendance, performance, and participation surface in admin and student views.'],
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
    </tr>`).join('') : "<tr><td colspan='4' class='hint'>No categories yet.</td></tr>";
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
    </tr>`).join('') : "<tr><td colspan='9' class='hint'>No courses match the current filters.</td></tr>";
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
  ['currBody', 'sessionBody', 'planBody', 'mentorBody', 'faqBody', 'testimonialBody', 'certBody'].forEach((id) => { byId(id).innerHTML = ''; });
}

function ensureSectionRows() {
  if (!byId('currBody').children.length) addCurr();
  if (!byId('sessionBody').children.length) addSession();
  if (!byId('planBody').children.length) addPlan();
  if (!byId('mentorBody').children.length) addMentor();
  if (!byId('faqBody').children.length) addFaq();
  if (!byId('testimonialBody').children.length) addTestimonial();
  if (!byId('certBody').children.length) addCertification();
}

function courseNew() {
  courseReset();
  byId('editorTitle').textContent = 'Create Course';
  byId('editorText').textContent = 'Create, edit, shuffle, and delete every public course detail from one admin editor.';
  ensureSectionRows();
  renderStudents([]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addCurr(row = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='subject' value='${attr(row.subject || '')}'></td><td><input data-k='module' value='${attr(row.module || '')}'></td><td><input data-k='lecture' value='${attr(row.lecture || '')}'></td><td><input data-k='duration' value='${attr(row.duration || '')}'></td><td><select data-k='contentType'><option value='recorded'>Recorded</option><option value='live'>Live</option><option value='resource'>Resource</option><option value='quiz'>Quiz</option></select></td><td><select data-k='isFree'><option value='false'>No</option><option value='true'>Yes</option></select></td><td><input data-k='videoUrl' value='${attr(row.videoUrl || row.resourceUrl || '')}'></td><td>${rowControls()}</td>`;
  byId('currBody').appendChild(tr);
  tr.querySelector('[data-k="contentType"]').value = row.contentType || 'recorded';
  tr.querySelector('[data-k="isFree"]').value = String(Boolean(row.isFree));
}

function addSession(session = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-k='title' value='${attr(session.title || '')}'></td><td><input data-k='startTime' value='${attr(session.startTime || '')}'></td><td><input data-k='endTime' value='${attr(session.endTime || '')}'></td><td><input data-k='hostName' value='${attr(session.hostName || '')}'></td><td><input data-k='meetingUrl' value='${attr(session.meetingUrl || '')}'></td><td><select data-k='status'><option value='scheduled'>Scheduled</option><option value='live'>Live</option><option value='completed'>Completed</option><option value='cancelled'>Cancelled</option></select></td><td>${rowControls()}</td>`;
  byId('sessionBody').appendChild(tr);
  tr.querySelector('[data-k="status"]').value = session.status || 'scheduled';
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

function editCourse(id) {
  const course = S.courses.find((item) => item.id === id);
  if (!course) return;
  S.selected = id;
  byId('editorTitle').textContent = `Edit ${course.title}`;
  byId('editorText').textContent = 'Frontend listing, detail page, checkout, student dashboard, and learning workspace read these values.';
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
    curriculumRows: readRows('currBody', (row) => ({ subject: row.querySelector('[data-k="subject"]').value.trim(), module: row.querySelector('[data-k="module"]').value.trim(), lecture: row.querySelector('[data-k="lecture"]').value.trim(), duration: row.querySelector('[data-k="duration"]').value.trim(), contentType: row.querySelector('[data-k="contentType"]').value, isFree: row.querySelector('[data-k="isFree"]').value === 'true', videoUrl: row.querySelector('[data-k="videoUrl"]').value.trim() })).filter((item) => item.subject && item.module && item.lecture),
    liveSessions: readRows('sessionBody', (row) => ({ title: row.querySelector('[data-k="title"]').value.trim(), startTime: row.querySelector('[data-k="startTime"]').value.trim(), endTime: row.querySelector('[data-k="endTime"]').value.trim(), hostName: row.querySelector('[data-k="hostName"]').value.trim(), meetingUrl: row.querySelector('[data-k="meetingUrl"]').value.trim(), status: row.querySelector('[data-k="status"]').value })).filter((item) => item.title && item.startTime),
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

