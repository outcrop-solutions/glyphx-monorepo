export const History = ({ comments }) => {
  return (
    <ul className="mb-4">
      {comments?.length > 0 ? (
        <>
          {comments.map((item, idx) => (
            <li key={item.id}>
              <div className="flex justify-between mb-2">
                <div
                  className={`rounded-full ${
                    idx % 2 === 0 ? "bg-blue-600" : "bg-yellow"
                  } h-8 w-8 text-sm text-white flex items-center justify-center`}
                >
                  {`${item.author.split("@")[0][0].toUpperCase()}`}
                </div>
                <div className="w-10/12 text-white text-xs">{item.content}</div>
              </div>
            </li>
          ))}
        </>
      ) : null}
    </ul>
  );
};
