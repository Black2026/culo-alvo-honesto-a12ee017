import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface TextFieldProps {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string | undefined;
  max: number;
  min: number;
}

export function TextField({ id, label, hint, icon, value, onChange, placeholder, error, max, min }: TextFieldProps) {
  const count = value.trim().length;
  const over = value.length > max;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">{icon}</span>
        <div>
          <Label htmlFor={id} className="text-base font-semibold text-foreground">
            {label}
          </Label>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={`${id}-meta`}
        spellCheck
        className={cn(
          "min-h-72 resize-y rounded-xl bg-card text-[15px] leading-relaxed shadow-none md:min-h-96",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      <div id={`${id}-meta`} className="flex min-h-5 items-start justify-between gap-3 text-xs">
        {error ? (
          <span role="alert" className="flex items-center gap-1.5 font-medium text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </span>
        ) : (
          <span className="text-muted-foreground">Mínimo de {min} caracteres.</span>
        )}
        <span className={cn("shrink-0 tabular-nums text-muted-foreground", over && "font-semibold text-destructive")}>
          {count.toLocaleString("pt-BR")} / {max.toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
