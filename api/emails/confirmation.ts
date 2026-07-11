import { escapeHtml } from './escapeHtml'

interface ConfirmationData {
  senderName: string
  message: string
}

export function confirmationEmail({ senderName, message }: ConfirmationData): string {
  const escaped = escapeHtml(message).replace(/\n/g, '<br>')
  const firstName = escapeHtml(senderName.split(' ')[0])

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Message received</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0!important;padding:0!important;background-color:#05070f}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
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
                    <span style="font-family:'Syne',Georgia,serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">GC<span style="color:#818cf8;">.</span></span>
                  </td>
                  <td align="right">
                    <span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#374151;letter-spacing:3px;text-transform:uppercase;">genessis.dev</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top accent bar (3-column fade) -->
          <tr>
            <td style="padding-bottom:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="20%" style="height:1px;background-color:#05070f;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="60%" style="height:1px;background-color:#22d3ee;line-height:1px;font-size:1px;">&nbsp;</td>
                  <td width="20%" style="height:1px;background-color:#05070f;line-height:1px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#0c1020;border:1px solid rgba(34,211,238,0.15);border-top:0;border-radius:0 0 12px 12px;">

                <!-- Top accent bar -->
                <tr>
                  <td style="height:3px;background-color:#22d3ee;border-radius:0;line-height:3px;font-size:3px;">&nbsp;</td>
                </tr>

                <!-- Status + greeting -->
                <tr>
                  <td style="padding:32px 32px 8px;">
                    <!-- Status badge -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="background-color:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:100px;padding:5px 14px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="width:6px;height:6px;background-color:#4ade80;border-radius:50%;vertical-align:middle;">&nbsp;</td>
                              <td style="padding-left:8px;vertical-align:middle;">
                                <span style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#4ade80;letter-spacing:2px;text-transform:uppercase;">MESSAGE RECEIVED</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#22d3ee;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px 0;">// hello, ${firstName}</p>
                    <h1 style="font-family:'Syne',Georgia,serif;font-size:28px;font-weight:800;color:#ffffff;margin:0 0 14px 0;letter-spacing:-0.5px;line-height:1.15;">Got your message.</h1>
                    <p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#64748b;line-height:1.7;margin:0;">
                      Thanks for reaching out. I&rsquo;ll review it and get back to you within <span style="color:#e2e8f0;font-weight:500;">24 hours</span>.
                    </p>
                  </td>
                </tr>

                <!-- Thin divider -->
                <tr>
                  <td style="padding:20px 32px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="height:1px;background-color:#1a2035;line-height:1px;font-size:1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message echo -->
                <tr>
                  <td style="padding:24px 32px 28px;">
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#374151;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px 0;">YOUR MESSAGE</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                      style="background-color:#080d1a;border:1px solid #1e2a45;border-left:3px solid #22d3ee;border-radius:8px;">
                      <tr>
                        <td style="padding:18px 22px;">
                          <p style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#64748b;line-height:1.75;margin:0;font-style:italic;">&ldquo;${escaped}&rdquo;</p>
                        </td>
                      </tr>
                    </table>
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

                <!-- Social links -->
                <tr>
                  <td style="padding:22px 32px 32px;">
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:8px;color:#374151;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px 0;">FIND ME</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="https://github.com/soominjo"
                            style="display:inline-block;padding:8px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;color:#94a3b8;text-decoration:none;border:1px solid #1e2a45;border-radius:6px;letter-spacing:1px;">
                            GitHub &nearr;
                          </a>
                        </td>
                        <td>
                          <a href="https://www.linkedin.com/in/genessis-contreras-28320a375/"
                            style="display:inline-block;padding:8px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:10px;color:#94a3b8;text-decoration:none;border:1px solid #1e2a45;border-radius:6px;letter-spacing:1px;">
                            LinkedIn &nearr;
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
                    <p style="font-family:'JetBrains Mono','Courier New',monospace;font-size:9px;color:#1e293b;letter-spacing:1px;margin:0;">This is an automated confirmation. Please do not reply to this email.</p>
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
