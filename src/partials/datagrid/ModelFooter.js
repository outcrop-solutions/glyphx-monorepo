import { useEffect } from "react";

export const ModelFooter = ({
  sdt,
  url,
  setProgress,
  isQtOpen,
  setIsQtOpen,
}) => {
  // useEffect(() => {
  //   console.log({ url, sdt });
  //   if (window && window.core) {
  //     if (url) {
  //       window.core.OpenProject(url);
  //     } else {
  //       window.core.OpenProject({});
  //     }
  //   }
  // }, [sdt, url]);

  const handleOpen = () => {
    if (window && window.core) {
      if (isQtOpen && url && sdt) {
        console.log("Toggling");
        window.core.ToggleDrawer(true);
        // window.core.OpenProject(url);
        // setProgress(true);
        // setTimeout(() => {
        //   setProgress(false);
        // }, 3000);
      } else if (url) {
        window.core.OpenProject(url);
      } else {
        window.core.OpenProject({});
      }
    }
  };

  return (
    <div className="w-full h-11 border border-gray-600 bg-primary-dark-blue text-xs flex items-center fixed bottom-0">
      {sdt && (
        <div
          onClick={handleOpen}
          className="flex relative cursor-pointer group hover:bg-gray-600 items-center border-r border-r-gray-500 h-full px-4"
        >
          <div className="text-blue-400 mr-2 text-xs font-bold">SDT</div>
          <span className="text-white font-bold">{sdt}</span>
        </div>
      )}
      {/* <PlusIcon className="h-5 text-gray-600 mx-2" /> */}
    </div>
  );
};
