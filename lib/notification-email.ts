import type { AffectedAudit } from "@/lib/pricing-monitor";

const BASE_URL = "https://leakproof-gules.vercel.app";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function buildNotificationEmail(
  userEmail: string,
  affectedAudits: AffectedAudit[]
): { subject: string; html: string } {
  const totalAudits = affectedAudits.length;

  const changedTools = Array.from(
    new Set(
      affectedAudits.flatMap((audit) =>
        audit.changes.map((change) => change.toolName)
      )
    )
  );

  const subject =
    totalAudits === 1
      ? "Your Leakproof audit changed after AI pricing updates"
      : `${totalAudits} of your Leakproof audits changed after AI pricing updates`;

  const changesHtml = affectedAudits
    .map((audit) => {
      const oldSavings = audit.oldReport.totalMonthlySavings;
      const newSavings = audit.newReport.totalMonthlySavings;

      const changeRows = audit.changes
        .map(
          (change) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                <strong>${change.toolName}</strong><br />
                <span style="color:#737373;">${change.planName}</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                ${formatCurrency(change.oldPrice)}
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                ${formatCurrency(change.newPrice)}
              </td>
            </tr>
          `
        )
        .join("");

      return `
        <div style="margin-top: 28px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 14px;">
          <h2 style="margin: 0 0 12px; font-size: 18px;">
            Audit: ${audit.slug}
          </h2>

          <p style="margin: 0 0 16px; color: #525252; line-height: 1.6;">
            Previously this audit recommended potential savings of
            <strong>${formatCurrency(oldSavings)}/month</strong>.
            With the latest pricing, it now recommends
            <strong>${formatCurrency(newSavings)}/month</strong>.
          </p>

          <table style="width:100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr>
                <th align="left" style="padding-bottom: 8px; color:#737373;">Tool / Plan</th>
                <th align="left" style="padding-bottom: 8px; color:#737373;">Old</th>
                <th align="left" style="padding-bottom: 8px; color:#737373;">New</th>
              </tr>
            </thead>
            <tbody>
              ${changeRows}
            </tbody>
          </table>

          <a
            href="${BASE_URL}/audit/${audit.slug}/diff"
            style="display:inline-block; margin-top:18px; padding:12px 16px; background:#0a0a0a; color:white; text-decoration:none; border-radius:10px; font-weight:600;"
          >
            View updated audit
          </a>
        </div>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 32px; color: #171717;">
      <div style="margin-bottom: 28px;">
        <div style="font-size: 14px; color: #737373; margin-bottom: 8px;">
          Leakproof
        </div>

        <h1 style="font-size: 28px; line-height: 1.2; margin: 0;">
          AI pricing changed. Your audit results may be outdated.
        </h1>

        <p style="font-size: 16px; line-height: 1.7; color:#525252; margin-top: 14px;">
          Hi ${userEmail}, we detected pricing changes for
          <strong>${changedTools.join(", ")}</strong>.
          These changes affect ${totalAudits} of your saved Leakproof audits.
        </p>
      </div>

      ${changesHtml}

      <p style="font-size: 13px; line-height: 1.6; color:#737373; margin-top: 32px;">
        You are receiving this because you saved a Leakproof AI Spend Audit.
        This email is only sent when pricing changes affect your saved results.
      </p>
    </div>
  `;

  return {
    subject,
    html,
  };
}