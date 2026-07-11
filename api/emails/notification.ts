import { escapeHtml } from './escapeHtml'

interface NotificationData {
  senderName: string
  senderEmail: string
  message: string
  receivedAt: string
}

export function notificationEmail({ senderName, senderEmail, message, receivedAt }: NotificationData): string {
  const escaped = escapeHtml(message).replace(/\n/g, '<br>')
  const safeName = escapeHtml(senderName)
  const safeEmail = escapeHtml(senderEmail)

  const replySubject = encodeURIComponent(`Re: Your message to Genessis`)
  const replyBody = encodeURIComponent(`Hi ${senderName},\n\nThanks for reaching out! `)
  const replyHref = escapeHtml(`mailto:${senderEmail}?subject=${replySubject}&body=${replyBody}`)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>New Portfolio Message</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0!important;padding:0!important;background-color:#05070f}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#05070f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#05070f;">
    <tr>
      <td align="center" style="padding:48px 20px 64px;">

        <!-- Wrapper -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Navbar -->
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:'Syne',Georgia,serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;text-decoration:none;">GC<span style="color:#818cf8;">.</span></span>
                  </td>
                  <td align="right">
                    <span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#374151;letter-spacing:3px;text-transform:uppercase;">NEW&nbsp;MESSAGE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top divider with glow approximation -->
          <tr>
            <td style="padding-bottom:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="20%" style="height:1px;background-color:#05070f;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="60%" style="height:1px;background-color:#6366f1;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="20%" style="height:1px;background-color:#05070f;line-height:1px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0c1020;border:1px solid rgba(99,102,241,0.2);border-top:0;border-radius:0 0 12px 12px;">

                <!-- Card top accent bar -->
                <tr>
                  <td style="height:3px;background-color:#6366f1;border-radius:0;line-height:3px;font-size:3px;">&nbsp;</td>
                </tr>

                <!-- Card header -->
                <tr>
                  <td style="padding:28px 32px 20px;">
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#6366f1;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px 0;">// contact.received</p>
                    <h1 style="font-family:'Syne',Georgia,serif;font-size:24px;font-weight:800;color:#ffffff;margin:0;letter-spacing:-0.3px;line-height:1.2;">Someone reached out</h1>
                  </td>
                </tr>

                <!-- Thin divider -->
                <tr>
                  <td style="padding:0 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px;background-color:#1a2035;line-height:1px;font-size:1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Sender info row -->
                <tr>
                  <td style="padding:24px 32px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding-right:12px;vertical-align:top;">
                          <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;color:#374151;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">FROM</p>
                          <p style="font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:600;color:#e2e8f0;margin:0;">${safeName}</p>
                        </td>
                        <td width="50%" style="padding-left:12px;vertical-align:top;">
                          <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;color:#374151;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">EMAIL</p>
                          <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;color:#22d3ee;margin:0;word-break:break-all;">${safeEmail}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message block -->
                <tr>
                  <td style="padding:0 32px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background-color:#080d1a;border:1px solid #1e2a45;border-left:3px solid #6366f1;border-radius:8px;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;color:#6366f1;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px 0;">MESSAGE</p>
                          <p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#94a3b8;line-height:1.75;margin:0;">${escaped}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:0 32px 36px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-radius:8px;background-color:#6366f1;">
                          <a href="${replyHref}"
                            style="display:inline-block;padding:13px 28px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;border-radius:8px;">
                            Reply to ${safeName} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#1e293b;letter-spacing:2px;text-transform:uppercase;margin:0;">${receivedAt}</p>
                  </td>
                  <td align="right">
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#1e293b;letter-spacing:1px;margin:0;">genessis.dev</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
