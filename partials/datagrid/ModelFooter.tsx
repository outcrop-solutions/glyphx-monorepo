import { useEffect } from "react";
import * as dayjs from "dayjs";
import { useRecoilValue } from "recoil";
import { payloadSelector, selectedProjectSelector,sdtValue } from "@/state/project";
// import { PlusIcon } from "@heroicons/react/solid";

export const ModelFooter = () => {
  const payload = useRecoilValue(payloadSelector);
  const name = useRecoilValue(sdtValue)
  const { sdt, url } = payload;

  const handleOpen = () => {
    // @ts-ignore

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
  };

  // useEffect(()=>{
  //   console.log({name})
  // },[name])

  return (
    <div className="w-full h-11 border border-gray bg-primary-dark-blue text-xs flex items-center">
      {name && (
        <div
          // onClick={handleOpen}
          className="flex relative cursor-pointer group hover:bg-gray items-center border-r border-r-gray h-full px-4"
        >
          <div className="text-cyan mr-2 text-xs font-bold">SDT</div>
          <span className="text-white font-bold">{name}</span>
        </div>
      )}
      {/* <PlusIcon className="h-5 text-gray mx-2" /> */}
    </div>
  );
};
