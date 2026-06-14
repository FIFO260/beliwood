// HTML šablóny pre e-maily objednávky. Inline štýly — e-mailoví klienti
// (Gmail, Outlook) ignorujú <style> bloky aj externé CSS.

export interface OrderItem {
  product: { name: string; price: number; sku?: string; img?: string };
  quantity: number;
}

export interface OrderPayload {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  zip: string;
  note?: string;
  items: OrderItem[];
  total: number;
}

const INK = "#0D1321";
const LIME = "#C5D86D";
const ROSE = "#86615C";
const LINEN = "#FFEDDF";

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function itemsTable(items: OrderItem[], total: number, showImages = false): string {
  const rows = items
    .map((it) => {
      const imgCell =
        showImages && it.product.img
          ? `<td style="padding:8px 12px 8px 0;vertical-align:middle;width:64px;">
              <img src="${esc(it.product.img)}" alt="" width="60" height="60"
                style="width:60px;height:60px;object-fit:cover;border-radius:4px;display:block;" />
            </td>`
          : "";
      const skuBadge = it.product.sku
        ? `<span style="display:inline-block;background:${LINEN};color:${ROSE};font-size:11px;font-family:monospace;padding:1px 6px;border-radius:3px;margin-top:3px;letter-spacing:.5px;">${esc(it.product.sku)}</span>`
        : "";
      return `
      <tr>
        ${imgCell}
        <td style="padding:10px 0;border-bottom:1px solid #e7ddd2;color:${INK};font-size:14px;vertical-align:middle;">
          <div>${esc(it.product.name)}</div>
          ${skuBadge}
          <div style="color:${ROSE};font-size:12px;margin-top:2px;">${it.quantity} × ${it.product.price} €</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #e7ddd2;color:${INK};font-size:14px;font-weight:600;text-align:right;white-space:nowrap;vertical-align:middle;">
          ${it.product.price * it.quantity} €
        </td>
      </tr>`;
    })
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0;">
    ${rows}
    <tr>
      <td colspan="3" style="padding:14px 0 0;color:${INK};font-size:16px;font-weight:700;">Celkom</td>
      <td style="padding:14px 0 0;color:${INK};font-size:20px;font-weight:700;text-align:right;">${total} €</td>
    </tr>
  </table>`;
}

// Voliteľné: nastav EMAIL_LOGO_URL na Vercel na verejnú URL svojho loga
// (napr. uploadni PNG do Vercel Blob a vlož URL sem).
// Ak premenná nie je nastavená, zobrazí sa textové logo.
function logoHtml(): string {
  const logoUrl = process.env.EMAIL_LOGO_URL;
  if (logoUrl) {
    return `<img src="${esc(logoUrl)}" alt="BeliWood" height="48" style="height:48px;display:block;" />`;
  }
  return `<span style="color:${LINEN};font-size:22px;font-weight:700;letter-spacing:.5px;">Beli<span style="color:${LIME};">Wood</span></span>`;
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${LINEN};">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:${INK};padding:22px 28px;">
      ${logoHtml()}
    </div>
    <div style="background:#ffffff;padding:28px;border:1px solid #e7ddd2;border-top:none;">
      ${inner}
    </div>
    <p style="color:${ROSE};font-size:11px;text-align:center;margin:20px 0 0;">
      BeliWood · Masívne drevo a nábytok · Slovenská republika
    </p>
  </div>
</body></html>`;
}

/** E-mail pre admina — kompletný prehľad objednávky vrátane fotiek a SKU kódov. */
export function adminEmail(o: OrderPayload) {
  const phone = o.phone?.trim() ? esc(o.phone) : "—";
  const note = o.note?.trim()
    ? `<p style="margin:18px 0 0;color:${INK};font-size:14px;"><strong>Poznámka:</strong><br>${esc(o.note).replace(/\n/g, "<br>")}</p>`
    : "";

  const inner = `
  <p style="margin:0 0 4px;color:${ROSE};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Nová objednávka</p>
  <h1 style="margin:0 0 20px;color:${INK};font-size:22px;">${esc(o.name)}</h1>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
    <tr><td style="padding:4px 0;color:${ROSE};font-size:13px;width:90px;">E-mail</td><td style="padding:4px 0;color:${INK};font-size:14px;"><a href="mailto:${esc(o.email)}" style="color:${INK};">${esc(o.email)}</a></td></tr>
    <tr><td style="padding:4px 0;color:${ROSE};font-size:13px;">Telefón</td><td style="padding:4px 0;color:${INK};font-size:14px;">${phone}</td></tr>
    <tr><td style="padding:4px 0;color:${ROSE};font-size:13px;vertical-align:top;">Adresa</td><td style="padding:4px 0;color:${INK};font-size:14px;">${esc(o.street)}<br>${esc(o.zip)} ${esc(o.city)}</td></tr>
  </table>
  <div style="border-top:2px solid ${INK};margin-top:18px;padding-top:6px;">
    <p style="margin:0 0 4px;color:${ROSE};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Položky</p>
    ${itemsTable(o.items, o.total, true)}
  </div>
  ${note}`;

  return {
    subject: `Nová objednávka — ${o.name} (${o.total} €)`,
    html: shell(inner),
    text:
      `Nová objednávka od ${o.name}\n` +
      `E-mail: ${o.email}\nTelefón: ${o.phone || "—"}\n` +
      `Adresa: ${o.street}, ${o.zip} ${o.city}\n\n` +
      o.items
        .map(
          (i) =>
            `- [${i.product.sku ?? "—"}] ${i.product.name} (${i.quantity} × ${i.product.price} €) = ${i.product.price * i.quantity} €`
        )
        .join("\n") +
      `\n\nCelkom: ${o.total} €` +
      (o.note?.trim() ? `\n\nPoznámka: ${o.note}` : ""),
  };
}

/** Potvrdzovací e-mail pre zákazníka. */
export function customerEmail(o: OrderPayload) {
  const inner = `
  <p style="margin:0 0 4px;color:${ROSE};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Objednávka prijatá</p>
  <h1 style="margin:0 0 16px;color:${INK};font-size:24px;">Ďakujeme, ${esc(o.name.split(" ")[0] || o.name)}!</h1>
  <p style="margin:0 0 16px;color:${INK};font-size:15px;line-height:1.6;">
    Vaša objednávku sme úspešne prijali. Čoskoro vas budeme kontaktovať
    na dohodnutie detailov a doručenia.
  </p>
  <div style="background:${LINEN};padding:18px 20px;margin:8px 0;">
    <p style="margin:0 0 4px;color:${ROSE};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Zhrnutie</p>
    ${itemsTable(o.items, o.total, true)}
  </div>
  <p style="margin:18px 0 0;color:${ROSE};font-size:13px;line-height:1.6;">
    Doručovacia adresa: ${esc(o.street)}, ${esc(o.zip)} ${esc(o.city)}<br>
    V prípade otázok odpovedzte na tento e-mail alebo nás kontaktujte na
    <a href="mailto:stolybeliwood@gmail.com" style="color:${INK};">stolybeliwood@gmail.com</a>.
  </p>`;

  return {
    subject: "Ďakujeme za vašu objednávku — BeliWood",
    html: shell(inner),
    text:
      `Ďakujeme za vašu objednávku!\n\n` +
      `Vašu objednávku sme prijali a čoskoro vás budeme kontaktovať na dohodnutie detailov a doručenia.\n\n` +
      o.items
        .map(
          (i) =>
            `- ${i.product.name} (${i.quantity} × ${i.product.price} €) = ${i.product.price * i.quantity} €`
        )
        .join("\n") +
      `\n\nCelkom: ${o.total} €\n\nBeliWood · stolybeliwood@gmail.com`,
  };
}
