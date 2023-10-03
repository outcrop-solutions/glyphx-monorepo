type Code = string | null;
type Name = string | null;

function html({id, code, name}: {id: Code; code: Code; name: Name}): string {
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/${id}/teams?code=${encodeURI(code || '')}`;

  return `
<body>
    <p>Hello there!</p>
    <p>You have created <strong>${name}</strong> workspace.</p>
    <p>Workspaces encapsulates your project's activities with your dedicated teammates.</p>
    <p>Start inviting your teammates by sharing this link: <a href="${link}">${link}</a></p>
    <p>In case you need any assistance, just hit reply.</p>
    <p>Cheers,<br />${process.env.EMAIL_FROM}</p>
</body>
`;
}

function text({id, code, name}: {id: Code; code: Code; name: Name}): string {
  const link = `${process.env.APP_URL || 'http://localhost:3000'}/${id}/teams?code=${encodeURI(code || '')}`;

  return `
Hello there!

You have created ${name} workspace.
Workspaces encapsulates your project's activities with your dedicated teammates.

Start inviting your teammates by sharing this link: ${link}

In case you need any assistance, just hit reply.

Cheers,
${process.env.EMAIL_FROM}
`;
}

export {html, text};
