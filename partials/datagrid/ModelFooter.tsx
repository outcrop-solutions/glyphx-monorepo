import { useEffect } from "react";
import * as dayjs from "dayjs";
// import { PlusIcon } from "@heroicons/react/solid";

export const ModelFooter = ({ sdt, url, project, setProgress }) => {
  const handleOpen = () => {
    // @ts-ignore
    if (project && window && window.core) {
      if (url && sdt) {
        console.log("Toggling");
        // @ts-ignore
        window.core.ToggleDrawer(true);
        // window.core.OpenProject(url);
        // setProgress(true);
        // setTimeout(() => {
        //   setProgress(false);
        // }, 3000);
      } else if (url) {
        // @ts-ignore
        window.core.OpenProject(JSON.stringify(url));
      } else {
        // @ts-ignore
        window.core.OpenProject({});
      }
    }
  };

  return (
    <div className="w-full h-11 border border-slate-600 bg-primary-dark-blue text-xs flex items-center">
      {sdt && (
        <div
          onClick={handleOpen}
          className="flex relative cursor-pointer group hover:bg-slate-600 items-center border-r border-r-slate-500 h-full px-4"
        >
          <div className="text-blue-400 mr-2 text-xs font-bold">SDT</div>
          <span className="text-white font-bold">{sdt}</span>
        </div>
      )}
      {/* <PlusIcon className="h-5 text-slate-600 mx-2" /> */}
    </div>
  );
};
