import type { Requirement } from "./analyze";
import { buildTermRegExp, cleanLine, isBullet, normalize, stripBullet } from "./normalize";

export type SectionKey =
  | "resumo"
  | "competencias"
  | "comportamentais"
  | "experiencia"
  | "academico"
  | "formacao"
  | "cursos"
  | "idiomas"
  | "outros";

interface SectionDef {
  key: SectionKey;
  title: string;
  re: RegExp;
}

/** Títulos reconhecidos (comparação sem acento, linha inteira). */
const SECTION_DEFS: SectionDef[] = [
  { key: "resumo", title: "RESUMO PROFISSIONAL", re: /^(resumo( profissional)?|perfil( profissional)?|objetivos?( profissional)?|sobre( mim)?|apresentacao|summary|resumo de qualificacoes)$/ },
  { key: "comportamentais", title: "COMPETÊNCIAS COMPORTAMENTAIS", re: /^(competencias comportamentais|habilidades comportamentais|soft skills)$/ },
  { key: "competencias", title: "COMPETÊNCIAS", re: /^(competencias( tecnicas)?|habilidades( tecnicas)?|conhecimentos( tecnicos)?( e habilidades)?|hard skills|skills|ferramentas|competencias e habilidades|habilidades e competencias|conhecimentos em informatica|informatica)$/ },
  { key: "experiencia", title: "EXPERIÊNCIA PROFISSIONAL", re: /^(experiencias?( profissional| profissionais)?|historico profissional|experiencia de trabalho|atuacao profissional|experiencia profissional relevante)$/ },
  { key: "academico", title: "EXPERIÊNCIA ACADÊMICA E PROJETOS", re: /^(projetos( academicos| pessoais| relevantes)?|experiencias? academicas?|atividades academicas|atividades extracurriculares|trabalhos academicos|projetos e atividades academicas)$/ },
  { key: "formacao", title: "FORMAÇÃO ACADÊMICA", re: /^(formacao( academica)?|educacao|escolaridade|formacao escolar|formacao educacional)$/ },
  { key: "cursos", title: "CURSOS E CERTIFICAÇÕES", re: /^(cursos( complementares| livres)?|certificacoes|certificados|cursos e certificacoes|certificacoes e cursos|qualificacoes|capacitacoes)$/ },
  { key: "idiomas", title: "IDIOMAS", re: /^(idiomas|linguas|linguas estrangeiras)$/ },
  { key: "outros", title: "", re: /^(informacoes adicionais|outras informacoes|voluntariado|trabalho voluntario|premios|premiacoes|publicacoes|atividades complementares)$/ },
];

const OUTPUT_ORDER: SectionKey[] = [
  "resumo",
  "competencias",
  "comportamentais",
  "experiencia",
  "academico",
  "formacao",
  "cursos",
  "idiomas",
  "outros",
];

export function detectHeading(line: string): SectionDef | null {
  const stripped = line.replace(/^[#*\-–•=\s]+/, "").replace(/[:*=\s]+$/, "");
  const norm = normalize(stripped);
  if (!norm || norm.length > 45) return null;
  return SECTION_DEFS.find((d) => d.re.test(norm)) ?? null;
}

interface ParsedSection {
  key: SectionKey;
  title: string;
  lines: string[];
}

export interface ParsedResume {
  header: string[];
  sections: ParsedSection[];
}

export function parseResume(text: string): ParsedResume {
  const header: string[] = [];
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = detectHeading(raw);
    if (heading) {
      const original = raw.replace(/^[#*\-–•=\s]+/, "").replace(/[:*=\s]+$/, "").trim();
      current = {
        key: heading.key,
        title: heading.title || original.toLocaleUpperCase("pt-BR"),
        lines: [],
      };
      sections.push(current);
      continue;
    }
    (current ? current.lines : header).push(raw);
  }
  return { header, sections };
}

function relevance(line: string, reqs: Requirement[]): number {
  const norm = normalize(line);
  let score = 0;
  for (const r of reqs) {
    if (r.weight === 0) continue;
    if (r.aliases.some((a) => buildTermRegExp(a).test(norm))) score += r.weight;
  }
  return score;
}

/** Remove linhas vazias repetidas e limpa cada linha preservando o conteúdo. */
function tidy(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line && (out.length === 0 || out[out.length - 1] === "")) continue;
    out.push(line);
  }
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
}

/** Reordena apenas sequências contíguas de tópicos, mantendo cargos/empresas/datas no lugar. */
function reorderBullets(lines: string[], reqs: Requirement[]): { lines: string[]; moved: number } {
  const out: string[] = [];
  let moved = 0;
  let run: string[] = [];
  const flush = () => {
    if (run.length > 1) {
      const sorted = run
        .map((line, idx) => ({ line, idx, score: relevance(line, reqs) }))
        .sort((a, b) => b.score - a.score || a.idx - b.idx);
      sorted.forEach((s, i) => {
        if (s.idx !== i) moved++;
      });
      out.push(...sorted.map((s) => s.line));
    } else out.push(...run);
    run = [];
  };
  for (const line of lines) {
    if (isBullet(line)) run.push(line);
    else {
      flush();
      out.push(line);
    }
  }
  flush();
  return { lines: out, moved };
}

function splitSkillItems(lines: string[]): string[] {
  const items: string[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    const line = stripBullet(raw.trim());
    if (!line) continue;
    for (const part of line.split(/\s*[;,|•·]\s*/)) {
      const item = part.trim().replace(/\.$/, "");
      const key = normalize(item);
      if (!item || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }
  return items;
}

export interface AdaptedResume {
  text: string;
  changes: string[];
  suggestions: string[];
}

/**
 * Gera uma versão reorganizada do currículo usando somente regras locais e
 * determinísticas. Nunca adiciona termos que não estejam no texto original.
 */
export function generateAdaptedResume(resume: string, requirements: Requirement[]): AdaptedResume {
  const changes: string[] = [];
  const suggestions: string[] = [];
  const active = requirements.filter((r) => r.weight > 0);
  const found = active.filter((r) => r.found);
  const missing = active.filter((r) => !r.found);
  const parsed = parseResume(resume);

  const headerLines = tidy(parsed.header);
  const out: string[] = [...headerLines];

  if (parsed.sections.length === 0) {
    changes.push("Nenhum título de seção reconhecido: o texto foi mantido na ordem original, apenas com formatação limpa.");
    suggestions.push(
      "Separe o currículo em seções com títulos claros (Resumo, Competências, Experiência Profissional, Formação Acadêmica) para facilitar a leitura por sistemas ATS.",
    );
  }

  // Agrupa seções do mesmo tipo
  const grouped = new Map<string, ParsedSection>();
  const order: string[] = [];
  for (const s of parsed.sections) {
    const id = s.key === "outros" ? `outros:${s.title}` : s.key;
    const existing = grouped.get(id);
    if (existing) existing.lines.push("", ...s.lines);
    else {
      grouped.set(id, { ...s, lines: [...s.lines] });
      order.push(id);
    }
  }

  const originalOrder = order.map((id) => grouped.get(id)!.key);
  const sortedIds = [...order].sort(
    (a, b) => OUTPUT_ORDER.indexOf(grouped.get(a)!.key) - OUTPUT_ORDER.indexOf(grouped.get(b)!.key),
  );
  if (sortedIds.join() !== order.join()) {
    changes.push("Seções reordenadas na sequência mais comum para ATS: Resumo, Competências, Experiência, Formação, Cursos e Idiomas.");
  }

  // Competências já comprovadas no texto, mas ausentes da seção de competências
  const skillsSection = grouped.get("competencias");
  const skillItems = skillsSection ? splitSkillItems(skillsSection.lines) : [];
  const evidenced = found.filter((r) => r.category !== "comportamental" && r.category !== "idioma");
  const toAppend = evidenced.filter((r) => !skillItems.some((item) => r.aliases.some((a) => buildTermRegExp(a).test(normalize(item)))));

  if (!skillsSection && evidenced.length) {
    grouped.set("competencias", { key: "competencias", title: "COMPETÊNCIAS", lines: [] });
    const nextIdx = sortedIds.findIndex(
      (id) => OUTPUT_ORDER.indexOf(grouped.get(id)!.key) > OUTPUT_ORDER.indexOf("competencias"),
    );
    sortedIds.splice(nextIdx === -1 ? sortedIds.length : nextIdx, 0, "competencias");
    changes.push(
      `Criada a seção COMPETÊNCIAS somente com termos que já aparecem no seu currículo: ${evidenced.map((r) => r.label).join(", ")}.`,
    );
  }

  let movedTotal = 0;
  for (const id of sortedIds) {
    const section = grouped.get(id)!;
    let body: string[];
    if (section.key === "competencias") {
      const items = skillsSection ? [...skillItems, ...toAppend.map((r) => r.label)] : evidenced.map((r) => r.label);
      const all = items
        .map((item, idx) => ({ item, idx, score: relevance(item, requirements) }))
        .sort((a, b) => b.score - a.score || a.idx - b.idx)
        .map((s) => s.item);
      if (skillsSection && all.slice(0, skillItems.length).join() !== skillItems.join()) {
        changes.push("Competências relacionadas à vaga foram movidas para o início da lista.");
      }
      if (skillsSection && toAppend.length) {
        changes.push(
          `Destacadas em COMPETÊNCIAS por já aparecerem em outras partes do currículo: ${toAppend.map((r) => r.label).join(", ")}.`,
        );
      }
      body = all.map((i) => `- ${i}`);
    } else if (section.key === "comportamentais") {
      body = splitSkillItems(section.lines)
        .map((item, idx) => ({ item, idx, score: relevance(item, requirements) }))
        .sort((a, b) => b.score - a.score || a.idx - b.idx)
        .map((s) => `- ${s.item}`);
    } else {
      const cleaned = tidy(section.lines);
      if (section.key === "experiencia" || section.key === "academico" || section.key === "cursos") {
        const { lines, moved } = reorderBullets(cleaned, requirements);
        movedTotal += moved;
        body = lines;
      } else body = cleaned;
    }
    if (!body.length) continue;
    out.push("", section.title, ...body);
  }

  if (movedTotal > 0) {
    changes.push("Dentro de cada experiência, os tópicos mais relacionados à vaga foram colocados primeiro (cargos, empresas e datas não foram alterados).");
  }
  if (parsed.sections.length) changes.push("Títulos de seção padronizados em letras maiúsculas e tópicos uniformizados com hífen.");
  changes.push("Texto em coluna única, sem tabelas, ícones ou elementos decorativos.");

  if (!originalOrder.includes("resumo")) {
    const labels = found.slice(0, 4).map((r) => r.label);
    suggestions.push(
      `Seu currículo não tem um resumo profissional. Considere escrever 2 a 3 linhas com seu objetivo e principais competências reais${
        labels.length ? ` (por exemplo: ${labels.join(", ")})` : ""
      }. Não criamos esse texto por você para não inventar informações.`,
    );
  }
  for (const r of missing) {
    suggestions.push(
      `A vaga cita "${r.label}" (${r.weight === 3 ? "essencial" : r.weight === 2 ? "importante" : "desejável"}). Não encontramos esse termo no seu currículo e ele NÃO foi adicionado. Inclua somente se você realmente tiver essa experiência.`,
    );
  }
  const experienceText = normalize(
    [...(grouped.get("experiencia")?.lines ?? []), ...(grouped.get("academico")?.lines ?? [])].join(" "),
  );
  const hasNumbers =
    /\d+\s?%|r\$\s?\d|\b\d+\s?(mil|relatorios?|clientes|pessoas|horas|projetos|registros|linhas|planilhas|usuarios)\b/.test(
      experienceText,
    );
  if (!hasNumbers) {
    suggestions.push(
      "Se houver resultados mensuráveis reais (ex.: tempo economizado, volume de dados, número de relatórios), acrescente-os às suas experiências.",
    );
  }

  return { text: out.join("\n").replace(/\n{3,}/g, "\n\n").trim(), changes, suggestions };
}
