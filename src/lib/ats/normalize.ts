/** Remove acentos, padroniza caixa e espaços para comparação determinística. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Cria uma expressão que encontra o termo como palavra inteira (sem pegar
 * "java" dentro de "javascript"). Aceita plural simples e variações de espaço/hífen.
 */
export function buildTermRegExp(alias: string): RegExp {
  const norm = normalize(alias);
  const body = norm
    .split(" ")
    .map((part) => escapeRegExp(part))
    .join("[\\s\\-/]+");
  const plural = /[a-z]$/.test(norm) && norm.length > 3 ? "s?" : "";
  return new RegExp(`(?<![a-z0-9])${body}${plural}(?![a-z0-9])`, "i");
}

const BULLET_RE = /^\s*(?:[-–—•●▪■◦*·>]|\d+[.)])\s+/;

export function isBullet(line: string): boolean {
  return BULLET_RE.test(line);
}

export function stripBullet(line: string): string {
  return line.replace(BULLET_RE, "").trim();
}

/** Limpa a linha mantendo o conteúdo: tabs, espaços duplicados, bullets padronizados. */
export function cleanLine(line: string): string {
  const compact = line.replace(/\t+/g, " ").replace(/[ \u00a0]{2,}/g, " ").trim();
  if (isBullet(compact)) return `- ${stripBullet(compact)}`;
  return compact;
}
