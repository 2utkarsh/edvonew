const paymentField = (id) => document.getElementById(id);

function renderPaymentSummary(payment = {}) {
  paymentField('paymentStatusLabel').textContent = payment.active ? 'Active' : 'Disabled';
  paymentField('paymentModeLabel').textContent = payment.testMode === false ? 'Live' : 'Test';
  paymentField('paymentCurrencyLabel').textContent = payment.currency || 'INR';
}

function fillPaymentForm(payment = {}) {
  paymentField('payActive').value = String(Boolean(payment.active));
  paymentField('payMode').value = String(payment.testMode !== false);
  paymentField('payKeyId').value = payment.keyId || '';
  paymentField('payKeySecret').value = payment.keySecret || '';
  paymentField('payCurrency').value = payment.currency || 'INR';
  paymentField('payTheme').value = payment.themeColor || '#c17017';
  paymentField('payCompany').value = payment.companyName || 'EDVO';
  paymentField('paySupport').value = payment.supportEmail || 'support@edvo.com';
  renderPaymentSummary(payment);
}

async function loadPaymentSettings() {
  try {
    const response = await adminFetch('/backend/api/admin/payment-settings');
    fillPaymentForm(response.data || {});
  } catch (error) {
    showToast(error.message || 'Unable to load payment settings', 'error');
  }
}

async function savePaymentSettings(event) {
  event.preventDefault();

  try {
    const response = await adminFetch('/backend/api/admin/payment-settings', {
      method: 'PATCH',
      body: JSON.stringify({
        active: paymentField('payActive').value === 'true',
        testMode: paymentField('payMode').value === 'true',
        keyId: paymentField('payKeyId').value.trim(),
        keySecret: paymentField('payKeySecret').value.trim(),
        currency: paymentField('payCurrency').value.trim() || 'INR',
        themeColor: paymentField('payTheme').value.trim() || '#c17017',
        companyName: paymentField('payCompany').value.trim() || 'EDVO',
        supportEmail: paymentField('paySupport').value.trim() || 'support@edvo.com',
      }),
    });

    fillPaymentForm(response.data || {});
    showToast('Payment settings saved', 'success');
  } catch (error) {
    showToast(error.message || 'Unable to save payment settings', 'error');
  }
}

paymentField('payForm')?.addEventListener('submit', savePaymentSettings);
loadPaymentSettings();
