// Initializer.init();
// const { code } = context.query;
// const workspace = await workspaceService.getInvitation(code);
// return { props: JSON.parse(JSON.stringify({ workspace })) };
export default async function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
