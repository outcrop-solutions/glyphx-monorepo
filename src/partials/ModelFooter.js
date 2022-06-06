import * as dayjs from "dayjs";
// import { PlusIcon } from "@heroicons/react/solid";

export const ModelFooter = ({
  sdt,
  url,
  project,
  setExpiry,
  setProgress,
  isQtOpen,
  setIsQtOpen,
}) => {
  const handleOpen = () => {
    if (project && window && window.core) {
      // expiry is not more that 10 minutes old
      const date1 = dayjs();
      let difference = date1.diff(dayjs(project.expiry), "minute");
      if (difference > 10) {
        console.log("Set Expiry!");
        setExpiry(true);
        return;
      }
      if (url && sdt) {
        console.log("Toggling");
        window.core.ToggleDrawer(true);
        // window.core.OpenProject(url);
        // setProgress(true);
        // setTimeout(() => {
        //   setProgress(false);
        // }, 3000);
      } else if (url) {
        window.core.OpenProject(JSON.stringify(url));
      } else {
        window.core.OpenProject({});
      }
    }
  };

  return (
    <div className="w-full h-11 border border-gray-600 bg-primary-dark-blue text-xs flex items-center">
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
