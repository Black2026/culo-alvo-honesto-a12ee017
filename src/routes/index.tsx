import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BriefcaseBusiness, Eraser, FileUser, FlaskConical, Lock, RefreshCw, ScanSearch, ShieldCheck, Target } from "lucide-react";

import { AdaptedPanel } from "@/components/ats/AdaptedPanel";
import { CompatibilityPanel } from "@/components/ats/CompatibilityPanel";
import { TextField } from "@/components/ats/TextField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAdaptedResume, type AdaptedResume } from "@/lib/ats/adapt";
import {
  createCustomRequirement,
  extractRequirements,
  MAX_CHARS,
  MIN_JOB_CHARS,
  MIN_RESUME_CHARS,
  summarize,
  validateInputs,
  type Requirement,
  type Weight,
} from "@/lib/ats/analyze";
import { normalize } from "@/lib/ats/normalize";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/lib/ats/sample";

const TITLE = "CurrículoAlvo ATS — Compare seu currículo com a vaga";
const DESCRIPTION =
  "Compare seu currículo com uma vaga, veja palavras-chave encontradas e ausentes e gere uma versão organizada para ATS, sem inventar qualificações.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface Snapshot {
  job: string;
  resume: string;
}

function Index() {
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [errors, setErrors] = useState<{ job?: string | undefined; resume?: string | undefined }>({});
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [adapted, setAdapted] = useState<AdaptedResume | null>(null);
  const [editorText, setEditorText] = useState("");
  const [tab, setTab] = useState("compatibilidade");
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => (snapshot ? summarize(requirements, snapshot.resume) : null), [requirements, snapshot]);
  const stale = !!snapshot && (snapshot.job !== job || snapshot.resume !== resume);

  const runAnalysis = () => {
    const errs = validateInputs(job, resume);
    setErrors(errs);
    if (errs.job || errs.resume) {
      toast.error("Revise os campos destacados antes de analisar.");
      return;
    }
    setSnapshot({ job, resume });
    setRequirements(extractRequirements(job, resume));
    setAdapted(null);
    setEditorText("");
    setTab("compatibilidade");
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const loadSample = () => {
    setJob(SAMPLE_JOB);
    setResume(SAMPLE_RESUME);
    setErrors({});
    toast.info("Exemplo fictício carregado. Clique em “Analisar compatibilidade”.");
  };

  const clearAll = () => {
    setJob("");
    setResume("");
    setErrors({});
    setSnapshot(null);
    setRequirements([]);
    setAdapted(null);
    setEditorText("");
    setTab("compatibilidade");
    toast.success("Todos os dados desta sessão foram apagados.");
  };

  const changeWeight = (id: string, weight: Weight) =>
    setRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, weight } : r)));

  const addRequirement = (term: string): string | null => {
    if (!snapshot) return "Faça a análise primeiro.";
    const req = createCustomRequirement(term, snapshot.resume);
    if (!req) return "Informe um termo entre 2 e 60 caracteres.";
    const key = normalize(req.label);
    if (requirements.some((r) => normalize(r.label) === key || r.id === req.id)) return "Esse requisito já está na lista.";
    setRequirements((prev) => [...prev, req]);
    toast.success(req.found ? `“${req.label}” encontrado no currículo.` : `“${req.label}” não aparece no currículo.`);
    return null;
  };

  const generate = () => {
    if (!snapshot) return;
    const out = generateAdaptedResume(snapshot.resume, requirements);
    setAdapted(out);
    setEditorText(out.text);
    setTab("adaptado");
  };

  const goToAdapted = () => {
    if (!adapted) generate();
    else setTab("adaptado");
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const hasData = !!(job || resume || snapshot);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-navy-foreground/10 bg-navy/95 text-navy-foreground backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Target className="size-5" />
            </span>
            <span className="text-lg">
              CurrículoAlvo <span className="text-primary-soft/80 font-semibold">ATS</span>
            </span>
          </a>
          <span className="hidden items-center gap-1.5 text-xs text-navy-muted sm:flex">
            <Lock className="size-3.5" />
            Processado no seu navegador
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-14 sm:px-6 md:pb-36 md:pt-20">
          <div className="fade-up max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy-foreground/15 bg-navy-foreground/5 px-3 py-1 text-xs font-medium text-navy-muted">
              <ScanSearch className="size-3.5" />
              Análise de compatibilidade para ATS
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Seu talento merece <span className="text-primary-soft">ser encontrado.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-navy-muted sm:text-lg">
              Compare seu currículo com uma oportunidade, descubra pontos de melhoria e prepare uma versão mais alinhada à
              vaga.
            </p>
            <p className="mt-6 inline-flex items-start gap-2 rounded-xl bg-success/15 px-4 py-2.5 text-sm font-medium text-success-soft">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Melhoramos a apresentação das suas experiências reais. Nunca inventamos qualificações.
            </p>
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-24 max-w-6xl px-4 pb-20 sm:px-6">
        <section aria-label="Dados para análise" className="fade-up rounded-3xl border bg-card p-5 shadow-card sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <TextField
              id="job"
              label="Descrição da vaga"
              hint="Cole o anúncio completo, com requisitos e diferenciais."
              icon={<BriefcaseBusiness className="size-5" />}
              value={job}
              onChange={(v) => {
                setJob(v);
                if (errors.job) setErrors((e) => ({ ...e, job: undefined }));
              }}
              placeholder={"Ex.: Requisitos obrigatórios\n- Excel avançado\n- SQL\n\nDiferenciais\n- Inglês intermediário"}
              error={errors.job}
              max={MAX_CHARS}
              min={MIN_JOB_CHARS}
            />
            <TextField
              id="resume"
              label="Currículo atual"
              hint="Cole o texto do seu currículo, com títulos de seção."
              icon={<FileUser className="size-5" />}
              value={resume}
              onChange={(v) => {
                setResume(v);
                if (errors.resume) setErrors((e) => ({ ...e, resume: undefined }));
              }}
              placeholder={"Seu nome\nE-mail | telefone\n\nEXPERIÊNCIA PROFISSIONAL\nCargo — Empresa (mês/ano – mês/ano)\n- Atividade realizada"}
              error={errors.resume}
              max={MAX_CHARS}
              min={MIN_RESUME_CHARS}
            />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={loadSample}>
                <FlaskConical />
                Carregar exemplo fictício
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" disabled={!hasData}>
                    <Eraser />
                    Limpar dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A vaga, o currículo, a análise e o currículo adaptado desta sessão serão apagados. Essa ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAll}>Limpar dados</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button size="lg" onClick={runAnalysis} className="shadow-glow sm:ml-auto">
              <ScanSearch />
              Analisar compatibilidade
            </Button>
          </div>
        </section>

        {result && snapshot && (
          <div ref={resultsRef} className="fade-up scroll-mt-24 pt-12">
            <div className="mb-5 flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Resultado da análise</h2>
              <p className="text-sm text-muted-foreground">
                Ajuste o peso de cada requisito se quiser: o percentual é recalculado na hora.
              </p>
            </div>
            {stale && (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm sm:flex-row sm:items-center">
                <p className="text-foreground">Você alterou a vaga ou o currículo. O resultado abaixo se refere aos textos anteriores.</p>
                <Button size="sm" onClick={runAnalysis} className="shrink-0 sm:ml-auto">
                  <RefreshCw />
                  Analisar novamente
                </Button>
              </div>
            )}
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-6 h-11 w-full rounded-xl sm:w-auto">
                <TabsTrigger value="compatibilidade" className="h-9 flex-1 rounded-lg px-5 sm:flex-none">
                  Compatibilidade
                </TabsTrigger>
                <TabsTrigger value="adaptado" className="h-9 flex-1 rounded-lg px-5 sm:flex-none">
                  Currículo adaptado
                </TabsTrigger>
              </TabsList>
              <TabsContent value="compatibilidade">
                <CompatibilityPanel
                  result={result}
                  onWeightChange={changeWeight}
                  onAddRequirement={addRequirement}
                  onGoToAdapted={goToAdapted}
                />
              </TabsContent>
              <TabsContent value="adaptado">
                <AdaptedPanel
                  adapted={adapted}
                  originalResume={snapshot.resume}
                  text={editorText}
                  onTextChange={setEditorText}
                  onGenerate={generate}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-foreground">CurrículoAlvo ATS</p>
          <p className="max-w-2xl md:text-right">
            Seus textos ficam apenas neste navegador: nada é salvo ou enviado a servidores. Ao fechar ou recarregar a página,
            os dados são apagados. O percentual é uma estimativa textual, não uma nota oficial de ATS.
          </p>
        </div>
      </footer>
    </div>
  );
}
