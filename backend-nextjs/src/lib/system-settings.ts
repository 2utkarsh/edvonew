import { SystemSettingModel } from '@/models/SystemSetting';

export const PAYMENT_SETTINGS_KEY = 'payment.gateway';

export interface PaymentGatewaySettings {
  provider: 'razorpay';
  active: boolean;
  testMode: boolean;
  keyId: string;
  keySecret: string;
  currency: string;
  companyName: string;
  themeColor: string;
  supportEmail: string;
}

export const defaultPaymentGatewaySettings: PaymentGatewaySettings = {
  provider: 'razorpay',
  active: false,
  testMode: true,
  keyId: '',
  keySecret: '',
  currency: 'INR',
  companyName: 'EDVO',
  themeColor: '#c17017',
  supportEmail: 'support@edvo.com',
};

export function normalizePaymentGatewaySettings(input: unknown): PaymentGatewaySettings {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};

  return {
    provider: 'razorpay',
    active: Boolean(source.active),
    testMode: source.testMode === undefined ? true : Boolean(source.testMode),
    keyId: String(source.keyId || ''),
    keySecret: String(source.keySecret || ''),
    currency: String(source.currency || 'INR').toUpperCase(),
    companyName: String(source.companyName || 'EDVO'),
    themeColor: String(source.themeColor || '#c17017'),
    supportEmail: String(source.supportEmail || 'support@edvo.com'),
  };
}

export async function getPaymentGatewaySettings() {
  const item = await SystemSettingModel.findOne({ key: PAYMENT_SETTINGS_KEY }).lean();
  return normalizePaymentGatewaySettings(item?.value);
}

export async function savePaymentGatewaySettings(input: unknown) {
  const value = normalizePaymentGatewaySettings(input);

  await SystemSettingModel.findOneAndUpdate(
    { key: PAYMENT_SETTINGS_KEY },
    {
      key: PAYMENT_SETTINGS_KEY,
      value,
      category: 'payments',
      description: 'Primary course payment gateway settings',
      type: 'object',
      isPublic: false,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return value;
}

export async function getPublicPaymentGatewaySettings() {
  const settings = await getPaymentGatewaySettings();

  return {
    provider: settings.provider,
    active: settings.active,
    testMode: settings.testMode,
    keyId: settings.keyId,
    currency: settings.currency,
    companyName: settings.companyName,
    themeColor: settings.themeColor,
    supportEmail: settings.supportEmail,
  };
}
