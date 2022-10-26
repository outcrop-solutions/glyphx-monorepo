import { useEffect } from "react";
import { filesOpenAtom } from "@/state/files";
import { useRecoilValue } from "recoil";
import { FileTab } from "./FileTab";
// import { PlusIcon } from "@heroicons/react/solid";

export const GridHeader = () => {
  const filesOpen = useRecoilValue(filesOpenAtom);

  return (
    <div className="w-full h-11 bg-secondary-space-blue border-b border-gray text-white text-xs flex items-center">
      {filesOpen && filesOpen.length > 0 && (
        <>
          {filesOpen.map((item, idx) => (
            <FileTab key={`${item}-${idx}`} item={item} />
          ))}
        </>
      )}
      {/* <PlusIcon className="h-5 text-gray mx-2" /> */}
    </div>
  );
};
