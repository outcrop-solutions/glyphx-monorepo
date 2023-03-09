const Content = ({ children }) => {
  return <div className="flex flex-col h-full p-5 space-y-5 overflow-y-auto md:px-10 md:w-3/4 bg-transparent">{children}</div>;
};

Content.Container = ({ children }: { children?: any }) => {
  return <div className="flex flex-col pb-10 space-y-5 bg-transparent">{children}</div>;
};

Content.Divider = ({ thick }: { thick?: boolean }) => {
  return thick ? <hr className="border-2 divide-gray" /> : <hr className="border" />;
};

Content.Empty = ({ children }: { children?: any }) => {
  return (
    <div>
      <div className="flex items-center justify-center p-5 bg-transparent border-4 border-dashed rounded">
        <p>{children}</p>
      </div>
    </div>
  );
};

Content.Title = ({ subtitle, title }: { subtitle?: string; title?: string }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <h3 className="text-gray-400">{subtitle}</h3>
    </div>
  );
};

export default Content;
