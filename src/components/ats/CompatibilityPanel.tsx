import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS } from "@/lib/ats/dictionary";
import { WEIGHT_LABELS, type AnalysisResult, type Requirement, type Weight } from "@/lib/ats/analyze";
import { cn } from "@/lib/utils";
import { CheckCircle2, CircleDashed, Info, Lightbulb, ListChecks, Plus, Quote, Sparkles, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MatchGauge } from "./MatchGauge";

interface CompatibilityPanelProps {
  result: AnalysisResult;
  onWeightChange: (id: string, weight: Weight) => void;
  onAddRequirement: (term: string) => string | null;
  onGoToAdapted: () => void;
}

export function CompatibilityPanel({ result, onWeightChange, onAddRequirement, onGoToAdapted }: CompatibilityPanelProps) {
  const active = result.requirements.filter((r) => r.weight > 0);
  const found = result.requirements.filter((r) => r.found);
  const missing = result.requirements.filter((r) => !r.found);
  const ignored = result.requirements.length - active.length;

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 rounded-2xl border bg-card p-6 shadow-card md:grid-cols-[auto_1fr] md:items-center md:p-8">
        <MatchGauge score={result.score} className="mx-auto md:mx-0" />
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {result.score === null
                ? "Não reconhecemos requisitos nesta vaga"
                : result.score >= 70
                  ? "Bom alinhamento com a vaga"
                  : result.score >= 40
                    ? "Alinhamento parcial com a vaga"
                    : "Baixo alinhamento com a vaga"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.score === null
                ? "Sem requisitos reconhecidos, não exibimos uma porcentagem. Você pode adicionar requisitos manualmente abaixo."
                : "Percentual calculado pela soma dos pesos dos requisitos encontrados dividida pela soma de todos os pesos."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Reconhecidos" value={active.length} />
            <Stat label="Encontrados" value={result.foundCount} tone="success" />
            <Stat label="Ausentes" value={result.missingCount} tone="warning" />
          </div>
          <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Estimativa textual baseada em palavras-chave. Não é a nota oficial de nenhum sistema ATS nem garantia de aprovação.
            {ignored > 0 && ` ${ignored} requisito(s) ignorado(s) por você.`}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RequirementList
          title="Competências encontradas"
          description="Termos da vaga que aparecem no seu currículo, com o trecho que comprova."
          icon={<CheckCircle2 className="size-5 text-success" />}
          items={found}
          empty="Nenhum requisito da vaga foi encontrado no currículo."
          onWeightChange={onWeightChange}
        />
        <RequirementList
          title="Competências ausentes"
          description="A vaga pede, mas não encontramos no seu currículo. Elas não serão adicionadas automaticamente."
          icon={<CircleDashed className="size-5 text-warning" />}
          items={missing}
          empty="Nenhum requisito ausente. Ótimo!"
          onWeightChange={onWeightChange}
        />
      </div>

      <AddRequirement onAdd={onAddRequirement} />

      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <header className="mb-4 flex items-center gap-2">
          <Lightbulb className="size-5 text-primary" />
          <h3 className="text-lg font-semibold">Recomendações</h3>
        </header>
        {result.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma recomendação no momento.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 rounded-xl border bg-background p-4">
                {rec.kind === "ausente" ? (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                ) : rec.kind === "evidencia" ? (
                  <Quote className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <ListChecks className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{rec.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-navy px-6 py-8 text-center text-navy-foreground sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-semibold">Pronto para organizar seu currículo?</p>
          <p className="text-sm text-navy-muted">Geramos uma versão reorganizada usando apenas as informações que você forneceu.</p>
        </div>
        <Button size="lg" onClick={onGoToAdapted} className="shrink-0 shadow-glow">
          <Sparkles />
          Gerar currículo adaptado
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        tone === "success" && "border-success/20 bg-success-soft",
        tone === "warning" && "border-warning/20 bg-warning-soft",
      )}
    >
      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{label}</p>
    </div>
  );
}

interface RequirementListProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: Requirement[];
  empty: string;
  onWeightChange: (id: string, weight: Weight) => void;
}

function RequirementList({ title, description, icon, items, empty, onWeightChange }: RequirementListProps) {
  return (
    <section className="flex flex-col rounded-2xl border bg-card p-6 shadow-card">
      <header className="mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary" className="ml-auto tabular-nums">
            {items.length}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {items.map((r) => (
            <li key={r.id} className={cn("flex flex-col gap-2 py-3 first:pt-0 last:pb-0", r.weight === 0 && "opacity-55")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">{r.label}</span>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                  {r.category === "personalizado" ? "Personalizado" : CATEGORY_LABELS[r.category]}
                </Badge>
                <Select value={String(r.weight)} onValueChange={(v) => onWeightChange(r.id, Number(v) as Weight)}>
                  <SelectTrigger className="ml-auto h-8 w-[8.5rem] text-xs" aria-label={`Peso de ${r.label}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {([3, 2, 1, 0] as Weight[]).map((w) => (
                      <SelectItem key={w} value={String(w)} className="text-xs">
                        {w > 0 ? `${WEIGHT_LABELS[w]} · ${w}` : WEIGHT_LABELS[w]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {r.found ? (
                <ul className="flex flex-col gap-1">
                  {r.evidence.map((ev, i) => (
                    <li key={i} className="border-l-2 border-success/50 pl-3 text-sm text-muted-foreground">
                      “{ev}”
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-l-2 border-warning/50 pl-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Na vaga:</span> {r.jobContext}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddRequirement({ onAdd }: { onAdd: (term: string) => string | null }) {
  const [term, setTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = onAdd(term);
    setError(err);
    if (!err) setTerm("");
  };
  return (
    <form onSubmit={submit} className="rounded-2xl border border-dashed bg-card/60 p-5">
      <label htmlFor="custom-req" className="text-sm font-semibold text-foreground">
        Faltou algum requisito?
      </label>
      <p className="text-sm text-muted-foreground">
        Nosso dicionário pode não reconhecer termos muito específicos. Adicione um requisito da vaga para verificá-lo no currículo.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          id="custom-req"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ex.: Metabase, conciliação bancária…"
          maxLength={60}
          aria-invalid={!!error}
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          <Plus />
          Adicionar requisito
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
