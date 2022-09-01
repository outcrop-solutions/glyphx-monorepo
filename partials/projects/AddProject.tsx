import { showAddProjectAtom } from "@/state/globals";
import { PlusIcon } from "@heroicons/react/solid";
import { useSetRecoilState } from "recoil";

export const AddProject = () => {
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  return (
    <div
      onClick={() => setShowAddProject(true)}
      className="bg-secondary-dark-blue col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-lg border border-opacity-50 border-slate-200"
    >
      <div className="flex flex-col items-center justify-center h-60">
        <PlusIcon className="mt-20 mb-4 h-6 w-6 text-white" />
        <div className="text-white">New Project</div>
      </div>
    </div>
  );
};
