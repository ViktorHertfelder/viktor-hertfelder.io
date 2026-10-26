export async function sendWithResend(subject: string, text: string) {
  const apiKey = required("RESEND_API_KEY");
  const from = required("CVE_EMAIL_FROM");
  const to = required("CVE_EMAIL_TO");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!response.ok) throw new Error(`Resend submission failed: HTTP ${response.status} ${await response.text()}`);
  return response.json() as Promise<{ id: string }>;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}
