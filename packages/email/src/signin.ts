type Email = string | null;
type Url = string | null;
function html({ email, url }: { email: Email; url: Url }): string {
  return `
<body>
    <p>Welcome! You are logging in with ${email}</p>
    <p>Click this link to sign in: <strong><a href="${url}" target="_blank">HERE</a></strong></p>
    <p>Alternatively, you can copy this link and open via browser: ${url}</p>
    <p>If you did not request this email you can safely ignore it.</p>
    <p>In case you need any assistance, just hit reply.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
}

function text({ email, url }: { email: Email; url: Url }): string {
  return `
Welcome! You are logging in with ${email}

You may now sign in using this link: ${url}

If you did not request this email you can safely ignore it.

In case you need any assistance, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
}

export { html, text };
