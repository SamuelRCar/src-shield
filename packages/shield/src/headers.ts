/**
 * Cabeçalhos de segurança padronizados — cobre A02 (config insegura),
 * AT-03/XSS (CSP) e AT-09/MitM (HSTS).
 */

export type CspPreset = "institucional" | "saas" | "ecommerce";

const CSP_BASE = [
  "default-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  // Next.js injeta <style> inline; CSP estrita com nonce por requisição é ajuste por projeto
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
];

const CSP_PRESETS: Record<CspPreset, string> = {
  institucional: [...CSP_BASE, "script-src 'self'", "connect-src 'self'"].join("; "),
  saas: [...CSP_BASE, "script-src 'self'", "connect-src 'self' https:"].join("; "),
  // e-commerce: libera só o provedor de pagamento — dado de cartão nunca passa pelo app (PCI DSS)
  ecommerce: [
    ...CSP_BASE,
    "script-src 'self' https://js.stripe.com",
    "frame-src https://js.stripe.com",
    "connect-src 'self' https://api.stripe.com",
  ].join("; "),
};

export interface SecurityHeadersOptions {
  /** Preset de CSP por tipo de projeto (padrão: institucional). */
  preset?: CspPreset;
  /** CSP customizada (sobrepõe o preset) ou `false` para omitir — não recomendado. */
  csp?: string | false;
  /** max-age do HSTS em segundos (padrão: 2 anos). */
  hstsMaxAgeSeconds?: number;
  frameOptions?: "DENY" | "SAMEORIGIN";
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

export function securityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
  const {
    preset = "institucional",
    csp,
    hstsMaxAgeSeconds = 63_072_000,
    frameOptions = "DENY",
    referrerPolicy = "strict-origin-when-cross-origin",
    permissionsPolicy = "camera=(), microphone=(), geolocation=()",
  } = options;

  const headers: Record<string, string> = {
    "Strict-Transport-Security": `max-age=${hstsMaxAgeSeconds}; includeSubDomains; preload`,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": frameOptions,
    "Referrer-Policy": referrerPolicy,
    "Permissions-Policy": permissionsPolicy,
  };
  if (csp !== false) {
    headers["Content-Security-Policy"] = csp ?? CSP_PRESETS[preset];
  }
  return headers;
}

/** Formato pronto para a função `headers()` do next.config.(js|ts). */
export function nextSecurityHeaders(options: SecurityHeadersOptions = {}) {
  return [
    {
      source: "/(.*)",
      headers: Object.entries(securityHeaders(options)).map(([key, value]) => ({ key, value })),
    },
  ];
}
