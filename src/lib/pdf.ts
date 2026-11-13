import type { jsPDF as JsPDFType } from "jspdf";
import { detectHeading } from "./ats/adapt";

type JsPDFCtor = typeof JsPDFType;

/**
 * As fontes padrão do PDF (Helvetica) cobrem o alfabeto latino (WinAnsi), incluindo
 * todos os acentos do português. Caracteres fora dessa tabela são trocados por
 * equivalentes simples para não virarem símbolos ilegíveis.
 */
export function sanitizeForPdf(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u2010-\u2012\u2015]/g, "-")
    .replace(/[●▪■◦►▶➤✓✔☑]/g, "•")
    .replace(/[\u2190-\u21ff]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[^\u0009\u000a\u0020-\u007e\u00a0-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac]/g, "");
}

const PAGE = { width: 210, height: 297, marginX: 20, marginTop: 20, marginBottom: 18 };

export function buildResumePdf(JsPDF: JsPDFCtor, text: string) {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: "Currículo", creator: "CurrículoAlvo ATS" });
  const contentWidth = PAGE.width - PAGE.marginX * 2;
  let y = PAGE.marginTop;
  const ptToMm = 0.3528;

  const ensureSpace = (h: number) => {
    if (y + h > PAGE.height - PAGE.marginBottom) {
      doc.addPage();
      y = PAGE.marginTop;
    }
  };

  const lines = sanitizeForPdf(text).replace(/\r\n?/g, "\n").split("\n");
  let nameDone = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      y += 2.2;
      continue;
    }
    if (!nameDone) {
      nameDone = true;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const wrapped = doc.splitTextToSize(line.trim(), contentWidth) as string[];
      const lh = 16 * ptToMm * 1.25;
      for (const w of wrapped) {
        ensureSpace(lh);
        y += lh;
        doc.text(w, PAGE.marginX, y - 1.2);
      }
      y += 1.5;
      continue;
    }
    const bulletMatch = line.match(/^\s*[-•*–]\s+(.*)$/);
    const isHeading =
      !bulletMatch && (!!detectHeading(line) || /^[A-ZÀ-Ý][A-ZÀ-Ý0-9 &/,-]{3,44}$/.test(line.trim()));
    if (isHeading) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      const lh = 11.5 * ptToMm * 1.3;
      ensureSpace(lh + 8);
      y += 3;
      y += lh;
      doc.text(line.trim(), PAGE.marginX, y - 1);
      doc.setLineWidth(0.25);
      doc.line(PAGE.marginX, y + 0.6, PAGE.width - PAGE.marginX, y + 0.6);
      y += 2.2;
      continue;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lh = 10.5 * ptToMm * 1.4;
    if (bulletMatch) {
      const indent = 5;
      const wrapped = doc.splitTextToSize(bulletMatch[1] ?? "", contentWidth - indent) as string[];
      wrapped.forEach((w, i) => {
        ensureSpace(lh);
        y += lh;
        if (i === 0) doc.text("•", PAGE.marginX + 1, y - 1);
        doc.text(w, PAGE.marginX + indent, y - 1);
      });
    } else {
      const wrapped = doc.splitTextToSize(line.trim(), contentWidth) as string[];
      for (const w of wrapped) {
        ensureSpace(lh);
        y += lh;
        doc.text(w, PAGE.marginX, y - 1);
      }
    }
  }
  return doc;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }
  downloadBlob(blob, filename);
}
