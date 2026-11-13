export type TermCategory = "tecnica" | "ferramenta" | "metodo" | "comportamental" | "idioma";

export interface TermDefinition {
  id: string;
  label: string;
  aliases: string[];
  category: TermCategory;
}

/**
 * Dicionário local de competências e termos profissionais.
 * Aliases são apenas variações de grafia do mesmo termo — nunca termos "parecidos".
 */
export const TERMS: TermDefinition[] = [
  // Dados e BI
  { id: "excel", label: "Excel", aliases: ["excel", "ms excel", "microsoft excel"], category: "ferramenta" },
  { id: "sql", label: "SQL", aliases: ["sql", "linguagem sql"], category: "tecnica" },
  { id: "mysql", label: "MySQL", aliases: ["mysql"], category: "ferramenta" },
  { id: "postgresql", label: "PostgreSQL", aliases: ["postgresql", "postgres"], category: "ferramenta" },
  { id: "sqlserver", label: "SQL Server", aliases: ["sql server"], category: "ferramenta" },
  { id: "oracle", label: "Oracle", aliases: ["oracle"], category: "ferramenta" },
  { id: "mongodb", label: "MongoDB", aliases: ["mongodb", "mongo db"], category: "ferramenta" },
  { id: "powerbi", label: "Power BI", aliases: ["power bi", "powerbi"], category: "ferramenta" },
  { id: "tableau", label: "Tableau", aliases: ["tableau"], category: "ferramenta" },
  { id: "looker", label: "Looker Studio", aliases: ["looker studio", "looker", "google data studio"], category: "ferramenta" },
  { id: "python", label: "Python", aliases: ["python"], category: "tecnica" },
  { id: "pandas", label: "Pandas", aliases: ["pandas"], category: "ferramenta" },
  { id: "numpy", label: "NumPy", aliases: ["numpy"], category: "ferramenta" },
  { id: "linguagem-r", label: "Linguagem R", aliases: ["linguagem r", "rstudio", "r studio"], category: "tecnica" },
  { id: "analise-dados", label: "Análise de dados", aliases: ["análise de dados", "analise de dados", "análises de dados", "data analysis", "análise de informações"], category: "metodo" },
  { id: "estatistica", label: "Estatística", aliases: ["estatística", "estatistica", "estatístico", "estatística descritiva"], category: "metodo" },
  { id: "dashboard", label: "Dashboards", aliases: ["dashboard", "painéis gerenciais", "painel gerencial"], category: "metodo" },
  { id: "etl", label: "ETL", aliases: ["etl"], category: "metodo" },
  { id: "machine-learning", label: "Machine Learning", aliases: ["machine learning", "aprendizado de máquina"], category: "tecnica" },
  { id: "data-visualization", label: "Visualização de dados", aliases: ["visualização de dados", "data visualization", "data viz"], category: "metodo" },
  { id: "big-data", label: "Big Data", aliases: ["big data"], category: "tecnica" },
  { id: "spark", label: "Apache Spark", aliases: ["spark", "pyspark"], category: "ferramenta" },
  { id: "kpi", label: "Indicadores (KPIs)", aliases: ["kpi", "indicadores de desempenho", "indicadores-chave"], category: "metodo" },
  { id: "vba", label: "VBA", aliases: ["vba", "macros"], category: "tecnica" },
  { id: "tabela-dinamica", label: "Tabelas dinâmicas", aliases: ["tabela dinâmica", "tabelas dinâmicas", "pivot table"], category: "ferramenta" },
  { id: "procv", label: "PROCV", aliases: ["procv", "vlookup", "procx", "xlookup"], category: "ferramenta" },
  { id: "google-sheets", label: "Google Sheets", aliases: ["google sheets", "planilhas google"], category: "ferramenta" },
  { id: "power-query", label: "Power Query", aliases: ["power query"], category: "ferramenta" },
  { id: "dax", label: "DAX", aliases: ["dax"], category: "tecnica" },

  // Desenvolvimento
  { id: "javascript", label: "JavaScript", aliases: ["javascript", "js"], category: "tecnica" },
  { id: "typescript", label: "TypeScript", aliases: ["typescript"], category: "tecnica" },
  { id: "react", label: "React", aliases: ["react", "reactjs", "react.js"], category: "ferramenta" },
  { id: "angular", label: "Angular", aliases: ["angular"], category: "ferramenta" },
  { id: "vue", label: "Vue.js", aliases: ["vue", "vue.js", "vuejs"], category: "ferramenta" },
  { id: "node", label: "Node.js", aliases: ["node.js", "nodejs", "node"], category: "ferramenta" },
  { id: "html", label: "HTML", aliases: ["html", "html5"], category: "tecnica" },
  { id: "css", label: "CSS", aliases: ["css", "css3"], category: "tecnica" },
  { id: "java", label: "Java", aliases: ["java"], category: "tecnica" },
  { id: "spring", label: "Spring", aliases: ["spring boot", "spring"], category: "ferramenta" },
  { id: "csharp", label: "C#", aliases: ["c#", "csharp"], category: "tecnica" },
  { id: "dotnet", label: ".NET", aliases: [".net", "dotnet"], category: "ferramenta" },
  { id: "php", label: "PHP", aliases: ["php"], category: "tecnica" },
  { id: "golang", label: "Go", aliases: ["golang"], category: "tecnica" },
  { id: "kotlin", label: "Kotlin", aliases: ["kotlin"], category: "tecnica" },
  { id: "swift", label: "Swift", aliases: ["swift"], category: "tecnica" },
  { id: "flutter", label: "Flutter", aliases: ["flutter"], category: "ferramenta" },
  { id: "git", label: "Git", aliases: ["git"], category: "ferramenta" },
  { id: "github", label: "GitHub", aliases: ["github"], category: "ferramenta" },
  { id: "docker", label: "Docker", aliases: ["docker"], category: "ferramenta" },
  { id: "kubernetes", label: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "ferramenta" },
  { id: "aws", label: "AWS", aliases: ["aws", "amazon web services"], category: "ferramenta" },
  { id: "azure", label: "Azure", aliases: ["azure", "microsoft azure"], category: "ferramenta" },
  { id: "gcp", label: "Google Cloud", aliases: ["google cloud", "gcp"], category: "ferramenta" },
  { id: "api-rest", label: "APIs REST", aliases: ["api rest", "apis rest", "restful", "rest api"], category: "tecnica" },
  { id: "linux", label: "Linux", aliases: ["linux"], category: "ferramenta" },
  { id: "testes", label: "Testes automatizados", aliases: ["testes automatizados", "testes unitários", "tdd"], category: "metodo" },
  { id: "ci-cd", label: "CI/CD", aliases: ["ci/cd", "ci cd", "integração contínua"], category: "metodo" },
  { id: "figma", label: "Figma", aliases: ["figma"], category: "ferramenta" },
  { id: "ux", label: "UX/UI", aliases: ["ux", "ui/ux", "ux/ui", "experiência do usuário"], category: "metodo" },

  // Gestão e negócios
  { id: "scrum", label: "Scrum", aliases: ["scrum"], category: "metodo" },
  { id: "kanban", label: "Kanban", aliases: ["kanban"], category: "metodo" },
  { id: "agile", label: "Metodologias ágeis", aliases: ["metodologias ágeis", "metodologia ágil", "agile", "ágil"], category: "metodo" },
  { id: "jira", label: "Jira", aliases: ["jira"], category: "ferramenta" },
  { id: "gestao-projetos", label: "Gestão de projetos", aliases: ["gestão de projetos", "gerenciamento de projetos", "project management"], category: "metodo" },
  { id: "pmo", label: "PMO", aliases: ["pmo"], category: "metodo" },
  { id: "sap", label: "SAP", aliases: ["sap"], category: "ferramenta" },
  { id: "erp", label: "ERP", aliases: ["erp"], category: "ferramenta" },
  { id: "crm", label: "CRM", aliases: ["crm", "salesforce"], category: "ferramenta" },
  { id: "office", label: "Pacote Office", aliases: ["pacote office", "microsoft office", "ms office"], category: "ferramenta" },
  { id: "word", label: "Word", aliases: ["word", "ms word"], category: "ferramenta" },
  { id: "powerpoint", label: "PowerPoint", aliases: ["powerpoint", "power point"], category: "ferramenta" },
  { id: "financas", label: "Finanças", aliases: ["finanças", "financeiro", "análise financeira"], category: "metodo" },
  { id: "contabilidade", label: "Contabilidade", aliases: ["contabilidade", "contábil"], category: "metodo" },
  { id: "marketing-digital", label: "Marketing digital", aliases: ["marketing digital"], category: "metodo" },
  { id: "seo", label: "SEO", aliases: ["seo"], category: "metodo" },
  { id: "google-analytics", label: "Google Analytics", aliases: ["google analytics", "ga4"], category: "ferramenta" },
  { id: "vendas", label: "Vendas", aliases: ["técnicas de vendas", "vendas consultivas", "experiência em vendas", "metas de vendas", "prospecção de clientes"], category: "metodo" },
  { id: "atendimento", label: "Atendimento ao cliente", aliases: ["atendimento ao cliente", "atendimento ao público", "customer success", "suporte ao cliente"], category: "metodo" },
  { id: "logistica", label: "Logística", aliases: ["logística", "supply chain", "cadeia de suprimentos"], category: "metodo" },
  { id: "rh", label: "Recursos humanos", aliases: ["recursos humanos", "recrutamento e seleção", "departamento pessoal"], category: "metodo" },
  { id: "lgpd", label: "LGPD", aliases: ["lgpd", "lei geral de proteção de dados"], category: "metodo" },
  { id: "relatorios", label: "Relatórios", aliases: ["relatório", "relatórios gerenciais", "reporte", "reports"], category: "metodo" },
  { id: "processos", label: "Melhoria de processos", aliases: ["melhoria de processos", "melhoria contínua", "mapeamento de processos", "lean", "six sigma"], category: "metodo" },
  { id: "negocios", label: "Visão de negócio", aliases: ["visão de negócio", "visão de negócios"], category: "metodo" },

  // Comportamentais
  { id: "comunicacao", label: "Comunicação", aliases: ["comunicação", "boa comunicação", "comunicativo", "comunicativa"], category: "comportamental" },
  { id: "trabalho-equipe", label: "Trabalho em equipe", aliases: ["trabalho em equipe", "trabalhar em equipe", "colaboração", "colaborativo", "colaborativa"], category: "comportamental" },
  { id: "proatividade", label: "Proatividade", aliases: ["proatividade", "proativo", "proativa"], category: "comportamental" },
  { id: "organizacao", label: "Organização", aliases: ["organização", "organizado", "organizada"], category: "comportamental" },
  { id: "lideranca", label: "Liderança", aliases: ["liderança", "liderar", "gestão de equipes", "gestão de pessoas"], category: "comportamental" },
  { id: "resolucao-problemas", label: "Resolução de problemas", aliases: ["resolução de problemas", "solução de problemas", "problem solving"], category: "comportamental" },
  { id: "pensamento-analitico", label: "Pensamento analítico", aliases: ["pensamento analítico", "raciocínio lógico", "perfil analítico", "capacidade analítica"], category: "comportamental" },
  { id: "atencao-detalhes", label: "Atenção aos detalhes", aliases: ["atenção aos detalhes", "detalhista"], category: "comportamental" },
  { id: "aprendizado", label: "Aprendizado contínuo", aliases: ["aprendizado contínuo", "vontade de aprender", "autodidata"], category: "comportamental" },
  { id: "negociacao", label: "Negociação", aliases: ["negociação"], category: "comportamental" },
  { id: "criatividade", label: "Criatividade", aliases: ["criatividade", "criativo", "criativa"], category: "comportamental" },
  { id: "adaptabilidade", label: "Adaptabilidade", aliases: ["adaptabilidade", "flexibilidade"], category: "comportamental" },

  // Idiomas
  { id: "ingles", label: "Inglês", aliases: ["inglês", "ingles", "english"], category: "idioma" },
  { id: "espanhol", label: "Espanhol", aliases: ["espanhol", "spanish"], category: "idioma" },
  { id: "frances", label: "Francês", aliases: ["francês"], category: "idioma" },
  { id: "alemao", label: "Alemão", aliases: ["alemão"], category: "idioma" },
];

export const CATEGORY_LABELS: Record<TermCategory, string> = {
  tecnica: "Técnica",
  ferramenta: "Ferramenta",
  metodo: "Conhecimento",
  comportamental: "Comportamental",
  idioma: "Idioma",
};
