type Code = string | null;
type Name = string | null;
function html({id, code, name}: {id: Code; code: Code; name: Name}): string {
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/${id}/teams?code=${encodeURI(code || '')}`;

  return `
<body>
    <p>Hello there!</p>
    <p>You have been invited to join <strong>${name}</strong> workspace.</p>
    <p>Workspaces encapsulates your project's activities with your dedicated teammates.</p>
    <p>Login into your account or you may open this link: <a href="${link}">${link}</a></p>
    <p>In case you need any assistance, just hit reply.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
}

function text({id, code, name}: {id: Code; code: Code; name: Name}): string {
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/${id}/teams?code=${encodeURI(code || '')}`;

  return `
Hello there!

You have been invited to join ${name} workspace.
Workspaces encapsulates your project's activities with your dedicated teammates.

Login into your account or you may open this link: ${link}

In case you need any assistance, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
}

export {html, text};
