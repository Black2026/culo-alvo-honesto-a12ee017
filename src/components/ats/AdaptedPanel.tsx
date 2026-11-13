import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AdaptedResume } from "@/lib/ats/adapt";
import { buildResumePdf, deliverFile } from "@/lib/pdf";
import { ClipboardCopy, FileDown, FileText, History, Info, Lightbulb, RotateCcw, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AdaptedPanelProps {
  adapted: AdaptedResume | null;
  originalResume: string;
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: () => void;
}

type JsPDFCtor = typeof import("jspdf").jsPDF;

export function AdaptedPanel({ adapted, originalResume, text, onTextChange, onGenerate }: AdaptedPanelProps) {
  const pdfRef = useRef<JsPDFCtor | null>(null);
  const [pdfReady, setPdfReady] = useState(false);

  // Carrega a biblioteca de PDF antes do clique para o download funcionar em todos os navegadores.
  useEffect(() => {
    let alive = true;
    import("jspdf")
      .then((m) => {
        if (!alive) return;
        pdfRef.current = m.jsPDF;
        setPdfReady(true);
      })
      .catch(() => toast.error("Não foi possível carregar o gerador de PDF. Recarregue a página."));
    return () => {
      alive = false;
    };
  }, []);

  if (!adapted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-14 text-center shadow-card">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Wand2 className="size-7" />
        </span>
        <div className="max-w-md">
          <h3 className="text-xl font-bold">Gerar currículo adaptado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Reorganizamos seu currículo com regras fixas e transparentes: títulos padronizados, seções em ordem
            reconhecível e informações relevantes para a vaga em destaque. Nada é inventado.
          </p>
        </div>
        <Button size="lg" onClick={onGenerate} className="shadow-glow">
          <Sparkles />
          Gerar currículo adaptado
        </Button>
      </div>
    );
  }

  const edited = text !== adapted.text;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.");
    }
  };

  const exportPdf = () => {
    if (!text.trim()) {
      toast.error("O currículo está vazio. Restaure a versão gerada antes de exportar.");
      return;
    }
    const JsPDF = pdfRef.current;
    if (!JsPDF) {
      toast.error("O gerador de PDF ainda está carregando. Tente novamente em instantes.");
      return;
    }
    try {
      const doc = buildResumePdf(JsPDF, text);
      void deliverFile(doc.output("blob"), "curriculo-adaptado.pdf");
      toast.success("PDF gerado. Confira o arquivo antes de enviar.");
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="note" className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-foreground">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
        <p>
          <strong>Revise todas as informações antes de usar este documento.</strong> Esta versão foi montada por regras
          automáticas de organização (sem inteligência artificial) a partir do seu texto. Confira nomes, datas, cargos e
          contatos.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">Editor do currículo</h3>
              {edited && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">editado</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                <ClipboardCopy />
                Copiar texto
              </Button>
              <Button size="sm" onClick={exportPdf} disabled={!pdfReady}>
                <FileDown />
                Exportar PDF
              </Button>
            </div>
          </div>
          <label htmlFor="resume-editor" className="sr-only">
            Texto do currículo adaptado
          </label>
          <Textarea
            id="resume-editor"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck
            className="min-h-[560px] resize-y rounded-xl bg-background font-mono text-[13.5px] leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onTextChange(adapted.text)} disabled={!edited}>
              <RotateCcw />
              Restaurar versão gerada
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onTextChange(originalResume.trim());
                toast.info("O editor agora mostra o seu currículo original.");
              }}
            >
              <History />
              Restaurar versão original
            </Button>
            <Button variant="ghost" size="sm" onClick={onGenerate}>
              <Sparkles />
              Gerar novamente
            </Button>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {text.length.toLocaleString("pt-BR")} caracteres
            </span>
          </div>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            No PDF, a primeira linha vira o nome em destaque, títulos em maiúsculas viram seções e linhas iniciadas com “-”
            viram tópicos.
          </p>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Wand2 className="size-4 text-primary" />O que foi feito
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {adapted.changes.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <h3 className="mb-1 flex items-center gap-2 font-semibold">
              <Lightbulb className="size-4 text-warning" />
              Sugestões para você avaliar
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">Não foram incluídas no currículo. Use apenas o que for verdade.</p>
            {adapted.suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma sugestão adicional.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {adapted.suggestions.map((s, i) => (
                  <li key={i} className="rounded-lg bg-muted p-3">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
