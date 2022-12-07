import dayjs from "dayjs";
import { useRouter } from "next/router";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRecoilValue } from "recoil";
import { projectsAtom } from "@/state/app";
import {userAtom } from "@/state/user";
import { usernameSelector } from "@/state/user";
import { TableListItem } from "./TableListItem";

export const TableView = () => {
  const router = useRouter();
  const projects = useRecoilValue(projectsAtom);
  const user = useRecoilValue(usernameSelector);
  
  dayjs.extend(relativeTime);
  return (
    <div className="text-white rounded-sm relative">
      <div className="px-0">
        {/* Table */}
        <div className="overflow-x-auto">
        <p className="font-rubik font-light text-[18px] leading-[21px] tracking-[0.01em] text-white">
              Recently Viewed Projects
        </p>
        <div className="flex flex-col my-4 space-y-2">
          {
            projects.map((item,idx)=>{
              return <TableListItem
                key = {idx}
                projectDetails={item}
              />
            })
          }
        </div>
        </div>
      </div>
    </div>
  );
};
