export function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font-size:13px;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#111111;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;
}

export function wrapEmail(title: string, intro: string, tableRows: string, footer: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e2e2;">
      <div style="background:#000000;color:#ffffff;padding:20px 24px;">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ff70e0;">d-stellar</p>
        <h1 style="margin:6px 0 0;font-size:20px;">${title}</h1>
      </div>
      <div style="padding:20px 24px;">
        <p style="margin:0 0 16px;font-size:14px;color:#111111;">${intro}</p>
        <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
        <p style="margin:20px 0 0;font-size:12px;color:#8a8a8a;">${footer}</p>
      </div>
    </div>
  </body>
</html>`;
}
