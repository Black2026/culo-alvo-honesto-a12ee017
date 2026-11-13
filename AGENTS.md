<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- All résumé analysis and adaptation runs client-side in `src/lib/ats/` with deterministic rules; no backend, AI or external API — user data must never leave the browser.
- The adapted-résumé generator may only reorder, reformat or re-label text already in the résumé; requirements missing from the résumé go to `suggestions`, never into the output text (covered by `src/lib/ats/ats.test.ts`).
- Score = sum of found requirement weights ÷ sum of all active weights; return `null` (no percentage) when there are no active requirements.
- PDF export uses jsPDF standard fonts (WinAnsi) via `src/lib/pdf.ts`, loaded with a dynamic import before the click so the download stays tied to the user gesture; sanitize text with `sanitizeForPdf`.
- Never render user-provided text as HTML (no `dangerouslySetInnerHTML`) and never persist it (no localStorage, no logs).
