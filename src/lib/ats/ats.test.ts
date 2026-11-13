import { describe, expect, it } from "vitest";
import { generateAdaptedResume } from "./adapt";
import { analyze, computeScore, createCustomRequirement, summarize, validateInputs, type Requirement } from "./analyze";
import { normalize, stripBullet } from "./normalize";
import { SAMPLE_JOB, SAMPLE_RESUME } from "./sample";

const req = (label: string, weight: Requirement["weight"], found: boolean): Requirement => ({
  id: label,
  label,
  category: "tecnica",
  aliases: [label],
  weight,
  jobContext: "",
  found,
  evidence: [],
});

describe("validação de entradas", () => {
  it("exige os dois campos preenchidos", () => {
    const e = validateInputs("", "   ");
    expect(e.job).toBe("Cole a descrição da vaga para continuar.");
    expect(e.resume).toBe("Cole o texto do seu currículo para continuar.");
  });
  it("recusa textos curtos demais", () => {
    const e = validateInputs("Vaga de analista", "Meu currículo");
    expect(e.job).toMatch(/mínimo de 80/);
    expect(e.resume).toMatch(/mínimo de 150/);
  });
  it("aceita o exemplo fictício", () => {
    expect(validateInputs(SAMPLE_JOB, SAMPLE_RESUME)).toEqual({});
  });
});

describe("percentual ponderado", () => {
  it("é a soma dos pesos encontrados dividida pelo total de pesos", () => {
    // encontrados: 3 + 1 = 4; total: 3 + 3 + 2 + 1 = 9 → 44%
    expect(computeScore([req("A", 3, true), req("B", 3, false), req("C", 2, false), req("D", 1, true)])).toBe(44);
  });
  it("não mostra porcentagem quando não há requisitos reconhecidos", () => {
    expect(computeScore([])).toBeNull();
    expect(analyze("Texto genérico sem nenhum termo técnico conhecido aqui. ".repeat(3), SAMPLE_RESUME).score).toBeNull();
  });
  it("requisitos marcados como 'Ignorar' (peso 0) não contam", () => {
    const r = summarize([req("A", 3, true), req("B", 0, false)], SAMPLE_RESUME);
    expect(r.score).toBe(100);
    expect(r.missingCount).toBe(0);
  });
});

describe("análise do exemplo fictício", () => {
  const result = analyze(SAMPLE_JOB, SAMPLE_RESUME);
  const get = (label: string) => result.requirements.find((r) => r.label === label)!;

  it("encontra Excel e análise de dados com evidência", () => {
    expect(get("Excel").found).toBe(true);
    expect(get("Excel").evidence.length).toBeGreaterThan(0);
    expect(get("Análise de dados").found).toBe(true);
  });
  it("aponta SQL, Power BI e Python como ausentes e essenciais", () => {
    for (const label of ["SQL", "Power BI", "Python"]) {
      expect(get(label).found).toBe(false);
      expect(get(label).weight).toBe(3);
    }
  });
  it("itens da seção Diferenciais recebem peso desejável (1)", () => {
    expect(get("Estatística").weight).toBe(1);
    expect(get("Comunicação").weight).toBe(1);
  });
  it("calcula 59% para o exemplo (17 de 29 pontos)", () => {
    expect(result.score).toBe(59);
  });
  it("não confunde 'excel' com 'excelente' nem 'java' com 'javascript'", () => {
    const r = analyze(
      "Requisitos obrigatórios:\n- Java e Excel avançado para relatórios da área de tecnologia da empresa.",
      "Fulano\nfulano@email.com\nTenho excelente comunicação e experiência com JavaScript em projetos pessoais e acadêmicos.",
    );
    const java = r.requirements.find((x) => x.label === "Java")!;
    const excel = r.requirements.find((x) => x.label === "Excel")!;
    expect(java.found).toBe(false);
    expect(excel.found).toBe(false);
  });
});

describe("currículo adaptado", () => {
  const result = analyze(SAMPLE_JOB, SAMPLE_RESUME);
  const adapted = generateAdaptedResume(SAMPLE_RESUME, result.requirements);
  const normAdapted = normalize(adapted.text);

  it("não adiciona termos ausentes como competências", () => {
    for (const term of ["sql", "power bi", "python", "dashboard", "estatistica"]) {
      expect(normAdapted).not.toContain(term);
    }
  });
  it("preserva todas as linhas factuais do currículo original", () => {
    const headings = /^(formacao|experiencia academica|experiencia profissional|habilidades|idiomas)$/;
    for (const raw of SAMPLE_RESUME.split("\n")) {
      const line = normalize(stripBullet(raw));
      if (!line || headings.test(line)) continue;
      if (line.startsWith("pacote office")) {
        for (const item of line.split(", ")) expect(normAdapted).toContain(item);
        continue;
      }
      expect(normAdapted).toContain(line);
    }
  });
  it("mantém datas e cargos exatamente como informados", () => {
    expect(adapted.text).toContain("Assistente Administrativa (estágio) — Loja Modelo Comércio Ltda. (ago/2024 – atual)");
    expect(adapted.text).toContain("Previsão de conclusão: dez/2026");
  });
  it("lista termos ausentes como sugestões separadas", () => {
    expect(adapted.suggestions.some((s) => s.includes('"SQL"') && s.includes("NÃO foi adicionado"))).toBe(true);
  });
  it("não cria resumo profissional inventado", () => {
    expect(adapted.text).not.toContain("RESUMO PROFISSIONAL");
  });
});

describe("requisito personalizado", () => {
  it("verifica o termo informado no currículo", () => {
    expect(createCustomRequirement("Monitoria", SAMPLE_RESUME)?.found).toBe(true);
    expect(createCustomRequirement("Tableau", SAMPLE_RESUME)?.found).toBe(false);
  });
});
