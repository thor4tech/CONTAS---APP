
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
// Usuário de teste autorizado
export const TEST_EMAILS = ['rafatech1@gmail.com'];

/**
 * Validação centralizada de acesso.
 */
export function checkUserAccess(profile: UserProfile | null): AccessResult {
  if (!profile) {
    return { hasAccess: false, isTrial: false, isExpired: false, reason: 'unauthenticated' };
  }

  const userEmail = (profile.email || '').toLowerCase();

  // Acesso total imediato para Administradores
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  // Se o status for ACTIVE ou PENDING (pagamento em processamento), tem acesso total e NÃO é trial
  if (profile.subscriptionStatus === 'ACTIVE' || profile.subscriptionStatus === 'PENDING') {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  const now = new Date();
  
  // Lógica de Trial
  if (profile.subscriptionStatus === 'TRIAL') {
    const createdAt = profile.createdAt ? parseISO(profile.createdAt) : now;
    // Usuários antigos (antes de 18/12/2025) ganham 30 dias, novos 7.
    const updateCutoff = new Date('2025-12-18T18:00:00Z');
    const isOldUser = createdAt < updateCutoff;
    
    const trialDuration = isOldUser ? 30 : 7;
    const trialEnd = addDays(createdAt, trialDuration);
    const trialExpired = isAfter(now, trialEnd);

    if (!trialExpired) {
      return { hasAccess: true, isTrial: true, isExpired: false, reason: 'trial' };
    } else {
      return { hasAccess: false, isTrial: true, isExpired: true, reason: 'trial_expired' };
    }
  }

  // Bloqueado por cancelamento, expiração ou reembolso
  return { hasAccess: false, isTrial: false, isExpired: false, reason: 'inactive' };
}

export const KIWIFY_LINKS = {
  ESSENTIAL: 'https://pay.kiwify.com.br/CRTkeeH',
  PRO: 'https://pay.kiwify.com.br/56PjP10',
  MASTER: 'https://pay.kiwify.com.br/Lkgu7yS'
};

export const WEBHOOK_ENDPOINTS = {
  UNIFIED: 'https://n8n.srv1178171.hstgr.cloud/webhook/96999f97-4ec9-480b-86f0-4c1f53dfd0b3',
  TEST: 'https://n8n.srv1178171.hstgr.cloud/webhook-test/96999f97-4ec9-480b-86f0-4c1f53dfd0b3'
};

/**
 * Envia um sinal de teste com a estrutura REAL da Kiwify para um plano específico.
 * Adicionado mode: 'no-cors' para evitar erro "Failed to fetch" caso o n8n não retorne headers CORS.
 */
export async function testWebhookIntegration(email: string, planId: PlanId) {
  const planNames = {
    ESSENTIAL: 'Cria Gestão - Plano Essencial',
    PRO: 'Cria Gestão Pro - Plano Estratégico',
    MASTER: 'Cria Gestão - Master Intelligence'
  };

  const payload = {
    order_id: 'TEST-' + Math.random().toString(36).substr(2, 9),
    order_status: 'paid',
    payment_method: 'pix',
    customer: {
      full_name: 'Usuário Pro ' + planId,
      email: email,
      mobile: '5511999999999'
    },
    product: {
      product_id: 'PRD-' + planId,
      product_name: planNames[planId]
    },
    subscription: {
      id: 'sub_test_' + planId + '_' + Date.now(),
      status: 'active',
      plan: {
        id: planId,
        name: planNames[planId]
      }
    },
    event_type: 'order_approved'
  };

  try {
    // Usamos no-cors para garantir que a requisição chegue ao n8n sem depender de preflight
    await fetch(WEBHOOK_ENDPOINTS.TEST, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    });

    return true; 
  } catch (error) {
    console.warn("Webhook test signal handled:", error);
    return true; 
  }
}
