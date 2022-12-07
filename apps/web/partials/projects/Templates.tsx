import { useEffect } from "react";
import { ChevronRightIcon } from "@heroicons/react/solid";
import {
  CalendarIcon,
  SpeakerphoneIcon,
  TerminalIcon,
} from "@heroicons/react/outline";
import { v4 as uuid } from "uuid";
import { createProject } from "../../graphql/mutations";
import { listProjects } from "../../graphql/queries";

import sortArray from "sort-array";
import { useUser } from "services";
import { useRouter } from "next/router";
import { CreateProjectMutation } from "API";
import {userAtom } from "@/state/user";
import { useRecoilValue } from "recoil";
const items = [
  {
    name: "Shipping Send by SKU",
    description: "Breakdown shipping send by SKU to discover new winners",
    href: "#",
    iconColor: "bg-pink-500",
    icon: SpeakerphoneIcon,
  },
  {
    name: "Logistics by Distribution center",
    description: "Identify efficient cost centers with ease",
    href: "#",
    iconColor: "bg-purple-500",
    icon: TerminalIcon,
  },
  {
    name: "Inventory Count by Warehouse",
    description: "Visualize inventory over time with seasonal trends",
    href: "#",
    iconColor: "bg-yellow",
    icon: CalendarIcon,
  },
];

export const Templates = () => {
  const router = useRouter();
  const user = useRecoilValue(userAtom);
  // const reloadProjects = async () => {
  //   try {
  //     if (user) {
  //       const projectData = await API.graphql(graphqlOperation(listProjects));
  //       const projectList = projectData.data.listProjects.items;

  //       const filtered = projectList.filter((el) =>
  //         el.shared ? el.shared.includes(user.username) : el.author === user.id
  //       );
  //       let sorted = sortArray(filtered, {
  //         by: "updatedAt",
  //         order: "desc",
  //       });

  //       setProjects((prev) => {
  //         let newData = [...filtered];
  //         return newData;
  //       });
  //     } else {
  //       console.log("No User");
  //     }
  //   } catch (error) {
  //     console.log("error on fetching projects", error);
  //   }
  // };
  // useEffect(() => {
  //   reloadProjects();
  // }, [user]);

  const handleCreate = async () => {
    const createProjectInput = {
      id: uuid(),
      name: "Template Project",
      description: "New project from empty template",
      // TODO : EDIT THIS TO MATCH NEW CRITERIA
      //@ts-ignore
      author: user?.username,
      //@ts-ignore
      shared: [user?.username],
      expiry: new Date(),
    };
    try {
      // const result = (await API.graphql(
      //   graphqlOperation(createProject, { input: createProjectInput })
      // )) as {
      //   data: CreateProjectMutation;
      // };
      // router.push(`/project/${result.data.createProject.id}`);
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <div className="max-w-lg mx-auto my-auto h-full flex flex-col grow justify-center">
      <div className="text-lg font-medium text-white">
        Create your first project
      </div>
      <div className="mt-1 text-sm text-gray">
        Get started by selecting a template or start from an empty project.
      </div>
      <ul className="mt-6 border-t border-b border-gray divide-y divide-gray">
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="relative group py-4 flex items-start space-x-3">
              <div className="shrink-0">
                <span
                  className={
                    "bg-yellow z-60 inline-flex items-center justify-center h-10 w-10 rounded-lg"
                  }
                >
                  <item.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">
                  <a href={item.href}>
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.name}
                  </a>
                  <span className="text-sm text-yellow ml-2">Coming Soon!</span>
                </div>
                <p className="text-sm text-gray">{item.description}</p>
              </div>
              <div className="shrink-0 self-center">
                <ChevronRightIcon
                  className="h-5 w-5 text-gray group-hover:text-gray"
                  aria-hidden="true"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex" onClick={handleCreate}>
        <span className="text-lg cursor-pointer font-medium text-white hover:font-bold">
          Start from an empty project<span aria-hidden="true"> &rarr;</span>
        </span>
      </div>
    </div>
  );
};
