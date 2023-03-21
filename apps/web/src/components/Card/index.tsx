/* eslint-disable react/display-name */
const Card = ({ children, danger }: { children?: any; danger?: any }) => {
  return danger ? (
    <div className="flex flex-col justify-between border-2 border-red-600 rounded">{children}</div>
  ) : (
    <div className="flex flex-col justify-between border border-gray text-white rounded">{children}</div>
  );
};

Card.Body = ({ children, subtitle, title }: { children?: any; subtitle?: string; title?: string }) => {
  return (
    <div className="flex flex-col p-5 space-y-3 overflow-auto">
      {title ? (
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      ) : (
        <div className="w-full h-8 rounded animate-pulse" />
      )}
      {subtitle && <h3 className="text-gray">{subtitle}</h3>}
      <div className="flex flex-col">{children}</div>
    </div>
  );
};

Card.Empty = ({ children }: { children?: any }) => {
  return (
    <div>
      <div className="flex items-center justify-center p-5 bg-primary-blue border-4 border-gray border-dashed rounded">
        <p>{children}</p>
      </div>
    </div>
  );
};

Card.Footer = ({ children }: { children?: any }) => {
  return (
    <div className="flex flex-row items-center justify-between px-5 py-3 space-x-5 bg-secondary-midnight border-t border-gray rounded-b">
      {children}
    </div>
  );
};

export default Card;
