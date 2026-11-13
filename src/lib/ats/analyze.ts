import { TERMS, type TermCategory, type TermDefinition } from "./dictionary";
import { buildTermRegExp, normalize, stripBullet } from "./normalize";

/** 3 = essencial, 2 = importante, 1 = desejável, 0 = ignorado pelo usuário. */
export type Weight = 0 | 1 | 2 | 3;

export const WEIGHT_LABELS: Record<Weight, string> = {
  3: "Essencial",
  2: "Importante",
  1: "Desejável",
  0: "Ignorar",
};

export interface Requirement {
  id: string;
  label: string;
  category: TermCategory | "personalizado";
  aliases: string[];
  weight: Weight;
  /** Trecho da vaga em que o termo aparece. */
  jobContext: string;
  found: boolean;
  /** Linhas do currículo que comprovam o termo (texto original). */
  evidence: string[];
  custom?: boolean;
}

export interface Recommendation {
  kind: "ausente" | "evidencia" | "estrutura";
  title: string;
  detail: string;
}

export interface AnalysisResult {
  requirements: Requirement[];
  score: number | null;
  foundCount: number;
  missingCount: number;
  recommendations: Recommendation[];
}

export const MIN_JOB_CHARS = 80;
export const MIN_RESUME_CHARS = 150;
export const MAX_CHARS = 20000;

export function validateInputs(job: string, resume: string): { job?: string; resume?: string } {
  const errors: { job?: string; resume?: string } = {};
  const j = job.trim();
  const r = resume.trim();
  if (!j) errors.job = "Cole a descrição da vaga para continuar.";
  else if (j.length < MIN_JOB_CHARS)
    errors.job = `A descrição da vaga está curta demais (mínimo de ${MIN_JOB_CHARS} caracteres).`;
  else if (j.length > MAX_CHARS) errors.job = `A descrição ultrapassa ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`;
  if (!r) errors.resume = "Cole o texto do seu currículo para continuar.";
  else if (r.length < MIN_RESUME_CHARS)
    errors.resume = `O currículo está curto demais (mínimo de ${MIN_RESUME_CHARS} caracteres).`;
  else if (r.length > MAX_CHARS) errors.resume = `O currículo ultrapassa ${MAX_CHARS.toLocaleString("pt-BR")} caracteres.`;
  return errors;
}

const DESIRABLE_RE = /(desejave(l|is)|diferencia(l|is)|sera um plus|nice to have|plus:|seria bom|e um plus|bonus)/;
const ESSENTIAL_RE = /(requisitos?|obrigatori|necessari|exigid|imprescindive|indispensave|precisa ter|requirements|must have|qualificac)/;
const NEUTRAL_HEADING_RE = /^(responsabilidades|atividades|o que voce vai fazer|sobre a vaga|sobre nos|descricao|beneficios)/;

const EDUCATION_LINE_RE = /(formacao|graduacao|graduado|bacharel|ensino superior|ensino medio|tecnologo|areas afins|cursando)/;

type SectionKind = "none" | "req" | "desej" | "neutral";

/** Peso sugerido para cada linha da vaga, a partir do contexto/seção em que aparece. */
function lineWeights(job: string): { line: string; weight: Weight; section: SectionKind; education: boolean }[] {
  const lines = job.split(/\r?\n/);
  let section: SectionKind = "none";
  return lines.map((raw) => {
    const line = raw.trim();
    const norm = normalize(line);
    const isHeading =
      norm.length > 0 && norm.length <= 60 && (/:$/.test(norm) || !/[.,;]/.test(norm)) && norm.split(" ").length <= 7;
    if (isHeading) {
      if (DESIRABLE_RE.test(norm)) section = "desej";
      else if (ESSENTIAL_RE.test(norm)) section = "req";
      else if (NEUTRAL_HEADING_RE.test(norm)) section = "neutral";
    }
    let weight: Weight = section === "req" ? 3 : section === "desej" ? 1 : 2;
    if (DESIRABLE_RE.test(norm)) weight = 1;
    else if (/(obrigatori|imprescindive|indispensave)/.test(norm)) weight = 3;
    return { line, weight, section, education: EDUCATION_LINE_RE.test(norm) };
  });
}

function findLines(text: string, aliases: string[]): string[] {
  const regs = aliases.map(buildTermRegExp);
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = stripBullet(raw.trim());
    if (!line) continue;
    const norm = normalize(line);
    if (regs.some((re) => re.test(norm))) {
      const snippet = line.length > 180 ? `${line.slice(0, 177)}…` : line;
      if (!out.includes(snippet)) out.push(snippet);
    }
  }
  return out;
}

export function matchTerm(text: string, aliases: string[]): boolean {
  const norm = normalize(text);
  return aliases.some((a) => buildTermRegExp(a).test(norm));
}

/** Identifica requisitos da vaga e verifica a presença de cada um no currículo. */
export function extractRequirements(job: string, resume: string, terms: TermDefinition[] = TERMS): Requirement[] {
  const weighted = lineWeights(job);
  const reqs: Requirement[] = [];
  for (const term of terms) {
    const regs = term.aliases.map(buildTermRegExp);
    let weight: Weight | 0 = 0;
    let context = "";
    for (const { line, weight: w, section, education } of weighted) {
      if (!line) continue;
      // Áreas de formação ("Estatística, Economia ou afins") não são competências.
      if (education) continue;
      // Competências comportamentais só contam quando pedidas explicitamente como requisito.
      if (term.category === "comportamental" && section === "neutral") continue;
      if (regs.some((re) => re.test(normalize(line)))) {
        if (w > weight) {
          weight = w;
          context = stripBullet(line);
        }
      }
    }
    if (!weight) continue;
    const evidence = findLines(resume, term.aliases);
    reqs.push({
      id: term.id,
      label: term.label,
      category: term.category,
      aliases: term.aliases,
      weight,
      jobContext: context.length > 180 ? `${context.slice(0, 177)}…` : context,
      found: evidence.length > 0,
      evidence: evidence.slice(0, 3),
    });
  }
  return reqs.sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label, "pt-BR"));
}

export function createCustomRequirement(term: string, resume: string, weight: Weight = 2): Requirement | null {
  const label = term.trim().replace(/\s+/g, " ");
  if (label.length < 2 || label.length > 60) return null;
  const evidence = findLines(resume, [label]);
  return {
    id: `custom-${normalize(label)}`,
    label,
    category: "personalizado",
    aliases: [label],
    weight,
    jobContext: "Adicionado manualmente por você.",
    found: evidence.length > 0,
    evidence: evidence.slice(0, 3),
    custom: true,
  };
}

/** Percentual ponderado: soma dos pesos encontrados ÷ soma de todos os pesos. */
export function computeScore(requirements: Requirement[]): number | null {
  const total = requirements.reduce((s, r) => s + r.weight, 0);
  // Sem requisitos ativos não existe base para um percentual.
  if (total === 0) return null;
  const found = requirements.filter((r) => r.found).reduce((s, r) => s + r.weight, 0);
  return Math.round((found / total) * 100);
}

const SECTION_CHECKS: { label: string; re: RegExp }[] = [
  { label: "Experiência", re: /^(experiencias?|historico profissional|atuacao profissional|experiencia academica|projetos)/ },
  { label: "Formação", re: /^(formacao|educacao|escolaridade)/ },
  { label: "Competências", re: /^(competencias|habilidades|conhecimentos|skills|hard skills|ferramentas)/ },
];

export function buildRecommendations(requirements: Requirement[], resume: string): Recommendation[] {
  const recs: Recommendation[] = [];
  const active = requirements.filter((r) => r.weight > 0);
  const missing = active.filter((r) => !r.found);
  const essentialMissing = missing.filter((r) => r.weight === 3);
  const otherMissing = missing.filter((r) => r.weight !== 3);

  if (essentialMissing.length) {
    recs.push({
      kind: "ausente",
      title: `Requisitos essenciais não encontrados: ${essentialMissing.map((r) => r.label).join(", ")}`,
      detail:
        "Se você tem experiência real com esses itens, descreva onde e como os utilizou (curso, projeto ou trabalho). Se não tem, não os inclua — considere estudá-los e citá-los somente depois.",
    });
  }
  if (otherMissing.length) {
    recs.push({
      kind: "ausente",
      title: `Itens complementares ausentes: ${otherMissing.map((r) => r.label).join(", ")}`,
      detail: "Mencione apenas o que você realmente domina. Esses itens pesam menos no percentual estimado.",
    });
  }

  const weakEvidence = active.filter((r) => r.found && r.evidence.length === 1 && r.weight >= 2);
  if (weakEvidence.length) {
    recs.push({
      kind: "evidencia",
      title: `Pouco contexto para: ${weakEvidence.map((r) => r.label).join(", ")}`,
      detail:
        "Esses termos aparecem só uma vez. Se for verdade, mostre-os também em uma experiência, com a atividade realizada e, se houver, um resultado concreto.",
    });
  }

  const lines = resume.split(/\r?\n/).map((l) => normalize(l.replace(/^[#*\-–•\s]+/, "").replace(/[:\s]+$/, "")));
  for (const check of SECTION_CHECKS) {
    if (!lines.some((l) => l.length <= 45 && check.re.test(l))) {
      recs.push({
        kind: "estrutura",
        title: `Seção "${check.label}" não identificada`,
        detail: `Use um título claro como "${check.label.toUpperCase()}" para que sistemas ATS reconheçam essa parte do currículo.`,
      });
    }
  }
  if (!/[\w.+-]+@[\w-]+\.[\w.]+/.test(resume)) {
    recs.push({
      kind: "estrutura",
      title: "E-mail de contato não encontrado",
      detail: "Inclua um e-mail profissional no topo do currículo.",
    });
  }
  if (!/(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/.test(resume)) {
    recs.push({
      kind: "estrutura",
      title: "Telefone não encontrado",
      detail: "Inclua um telefone com DDD no cabeçalho.",
    });
  }
  if (/\t/.test(resume) || /^\s*\|.*\|\s*$/m.test(resume)) {
    recs.push({
      kind: "estrutura",
      title: "Possível uso de tabelas ou colunas",
      detail: "Tabelas e colunas podem ser lidas fora de ordem por sistemas ATS. A versão adaptada usa texto em coluna única.",
    });
  }
  return recs;
}

export function analyze(job: string, resume: string): AnalysisResult {
  const requirements = extractRequirements(job, resume);
  return summarize(requirements, resume);
}

export function summarize(requirements: Requirement[], resume: string): AnalysisResult {
  const active = requirements.filter((r) => r.weight > 0);
  const foundCount = active.filter((r) => r.found).length;
  return {
    requirements,
    score: computeScore(requirements),
    foundCount,
    missingCount: active.length - foundCount,
    recommendations: buildRecommendations(requirements, resume),
  };
}
