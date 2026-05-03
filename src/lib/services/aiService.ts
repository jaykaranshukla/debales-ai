import { IIntegration, SHOPIFY_MOCK_DATA, CRM_MOCK_DATA } from '@/lib/db/models/Integration';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FREE_MODEL = 'llama-3.1-8b-instant';
const FALLBACK_MODEL = 'gemma2-9b-it';

export type AIMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function buildSystemPrompt(integrations: IIntegration[], productType: string): string {
  const productLabels: Record<string, string> = {
    ai_sales_assistant: 'Sales',
    ai_support_assistant: 'Customer Support',
    ai_crm_assistant: 'CRM',
  };
  const label = productLabels[productType] ?? 'AI';

  let prompt = `You are a helpful ${label} Assistant. Be concise, professional, and data-driven.\n`;
  prompt += `Answer questions accurately using any context data provided below.\n\n`;

  const shopify = integrations.find((i) => i.type === 'shopify');
  const crm = integrations.find((i) => i.type === 'crm');

  if (shopify?.enabled) {
    prompt += `=== SHOPIFY STORE DATA ===\n`;
    prompt += `Use this to answer product, order, or revenue questions.\n`;
    prompt += JSON.stringify(SHOPIFY_MOCK_DATA, null, 2);
    prompt += `\n\n`;
  }

  if (crm?.enabled) {
    prompt += `=== CRM DATA ===\n`;
    prompt += `Use this to answer questions about leads, customers, and pipeline.\n`;
    prompt += JSON.stringify(CRM_MOCK_DATA, null, 2);
    prompt += `\n\n`;
  }

  return prompt;
}

export function getStepMessages(integrations: IIntegration[]): string[] {
  const steps: string[] = ['Analyzing your request...'];
  if (integrations.find((i) => i.type === 'shopify' && i.enabled)) {
    steps.push('Fetching Shopify store data...');
  }
  if (integrations.find((i) => i.type === 'crm' && i.enabled)) {
    steps.push('Querying CRM records...');
  }
  steps.push('Generating response...');
  return steps;
}

export const aiService = {
  async chat(
    messages: AIMessage[],
    integrations: IIntegration[],
    productType: string
  ): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content ?? '';

    if (!process.env.GROQ_API_KEY) {
      return buildFallbackResponse(lastMessage, integrations);
    }

    const systemPrompt = buildSystemPrompt(integrations, productType);
    const body = {
      model: FREE_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 512,
      temperature: 0.7,
    };

    const headers = {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    };

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? buildFallbackResponse(lastMessage, integrations);
      }

      const err = await res.text();
      console.error('Groq primary model error:', err);

      // Try fallback model
      const fallbackRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, model: FALLBACK_MODEL }),
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return fallbackData.choices?.[0]?.message?.content ?? buildFallbackResponse(lastMessage, integrations);
      }

      const fallbackErr = await fallbackRes.text();
      console.error('Groq fallback model error:', fallbackErr);
      return buildFallbackResponse(lastMessage, integrations);

    } catch (err) {
      console.error('AI service error:', err);
      return buildFallbackResponse(lastMessage, integrations);
    }
  },
};

function buildFallbackResponse(userMessage: string, integrations: IIntegration[]): string {
  const shopify = integrations.find((i) => i.type === 'shopify' && i.enabled);
  const crm = integrations.find((i) => i.type === 'crm' && i.enabled);
  const msg = userMessage.toLowerCase();

  if (shopify) {
    if (msg.includes('product') || msg.includes('stock') || msg.includes('inventory')) {
      return `Based on your Shopify store:\n• Wireless Headphones Pro — $99.99 (45 in stock)\n• Smart Watch Series X — $249.99 (12 in stock)\n• Ergonomic Laptop Stand — $49.99 (100 in stock)`;
    }
    if (msg.includes('order') || msg.includes('revenue') || msg.includes('sales')) {
      return `Revenue: Today $1,250 · This week $8,750 · This month $32,000. 2 recent orders.`;
    }
  }

  if (crm) {
    if (msg.includes('lead') || msg.includes('prospect')) {
      return `CRM Leads:\n• Alice Johnson (TechCorp) — Hot, $5,000\n• Bob Wilson (StartupXYZ) — Warm, $2,500\nPipeline: $75,000 across 15 deals.`;
    }
    if (msg.includes('customer') || msg.includes('client')) {
      return `Customers: TechCorp Inc (Enterprise, $2,000 MRR), StartupXYZ (Pro, $500 MRR).`;
    }
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm your AI assistant. How can I help you today?`;
  }

  if (msg.includes('help') || msg.includes('what can you')) {
    const capabilities: string[] = [];
    if (shopify) capabilities.push('📦 Products & inventory', '🛒 Orders', '💰 Revenue reports');
    if (crm) capabilities.push('👤 Leads', '🤝 Customers', '📊 Pipeline');
    if (!shopify && !crm) return `Enable integrations in Admin Dashboard to unlock data-driven answers.`;
    return `I can help with:\n${capabilities.map((c) => `• ${c}`).join('\n')}`;
  }

  const enabledContext: string[] = [];
  if (shopify) enabledContext.push('Shopify');
  if (crm) enabledContext.push('CRM');

  if (enabledContext.length === 0) {
    return `No integrations enabled. Ask your admin to enable Shopify or CRM in the Admin Dashboard.`;
  }

  return `I have access to your ${enabledContext.join(' and ')} data. Ask me about products, orders, revenue, leads, or customers.`;
}