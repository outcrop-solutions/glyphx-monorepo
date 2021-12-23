export const ModelFooter = ({ sdt }) => {
  return (
    <div className="w-full h-11 border border-gray-600 bg-primary-dark-blue text-xs flex items-center fixed bottom-0">
      {sdt && (
        <div className="flex relative cursor-pointer group hover:bg-gray-600 items-center border-r border-r-white h-full px-4">
          <div className="text-blue-400 mr-2 text-xs font-bold">SDT</div>
          {sdt}
        </div>
      )}
      {/* <PlusIcon className="h-5 text-gray-600 mx-2" /> */}
    </div>
  );
};
