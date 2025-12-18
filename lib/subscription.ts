
import { UserProfile, PlanId, SubscriptionStatus } from '../types';
import { isAfter, parseISO, isValid, addDays } from 'date-fns';

export interface AccessResult {
  hasAccess: boolean;
  isTrial: boolean;
  isExpired: boolean;
  reason: string;
}

// Administradores oficiais
export const ADMIN_EMAILS = ['thor4tech@gmail.com', 'cleitontadeu@gmail.com'];

// Emails autorizados para funções de teste e simulação de webhooks
export const TEST_EMAILS = ['thor4tech@gmail.com', 'cleitontadeu10@gmail.com', 'cleitontadeu@gmail.com'];

export function checkUserAccess(profile: UserProfile | null): AccessResult {
  if (!profile) {
    return { hasAccess: false, isTrial: false, isExpired: false, reason: 'unauthenticated' };
  }

  // Correção do erro TypeError: toLowerCase de undefined
  const userEmail = (profile.email || '').toLowerCase();

  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  if (profile.subscriptionStatus === 'ACTIVE' || profile.subscriptionStatus === 'PENDING') {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  const now = new Date();
  if (profile.subscriptionStatus === 'TRIAL') {
    const createdAt = profile.createdAt ? parseISO(profile.createdAt) : now;
    const trialEnd = addDays(createdAt, 7);
    const trialExpired = isAfter(now, trialEnd);

    if (!trialExpired) {
      return { hasAccess: true, isTrial: true, isExpired: false, reason: 'trial' };
    } else {
      return { hasAccess: false, isTrial: true, isExpired: true, reason: 'trial_expired' };
    }
  }

  return { hasAccess: false, isTrial: false, isExpired: false, reason: 'inactive' };
}

export const KIWIFY_LINKS = {
  ESSENTIAL: 'https://pay.kiwify.com.br/CRTkeeH',
  PRO: 'https://pay.kiwify.com.br/56PjP10',
  MASTER: 'https://pay.kiwify.com.br/Lkgu7yS'
};

export async function testWebhookIntegration(email: string, planId: PlanId) {
  const payload = {
    customer: { email: email.toLowerCase() },
    product: { product_name: `Cria Gestão - ${planId}` },
    subscription: { status: 'active', plan: { id: planId } },
    event_type: 'order_approved'
  };

  try {
    await fetch('https://n8n.srv1178171.hstgr.cloud/webhook-test/96999f97-4ec9-480b-86f0-4c1f53dfd0b3', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (error) {
    return true; 
  }
}
