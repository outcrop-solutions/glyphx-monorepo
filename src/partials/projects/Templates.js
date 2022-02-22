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
import { API, graphqlOperation } from "aws-amplify";
import sortArray from "sort-array";
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
    iconColor: "bg-yellow-500",
    icon: CalendarIcon,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Templates = ({ setProject, setProjects, user }) => {
  const reloadProjects = async () => {
    try {
      // if (user) {
      const projectData = await API.graphql(graphqlOperation(listProjects));
      // console.log({ projectData })
      const projectList = projectData.data.listProjects.items;

      const filtered = projectList.filter((el) =>
        el.shared.includes(user.username)
      );
      let sorted = sortArray(filtered, {
        by: "updatedAt",
        order: "desc",
      });
      console.log({ sorted });
      setProjects((prev) => {
        let newData = [...filtered];
        return newData;
      });
      // } else {
      //   console.log("No User");
      // }
    } catch (error) {
      console.log("error on fetching projects", error);
    }
  };
  useEffect(() => {
    reloadProjects();
  }, [user]);

  const handleCreate = async () => {
    // upload project file

    // const { key } = await Storage.put(`${uuid()}.json`, projectFile, {
    // 	contentType: 'json',
    // })

    const createProjectInput = {
      id: uuid(),
      name: "Template Project",
      description: "New project from empty template",
      author: user.username,
      shared: [user.username],
    };
    try {
      console.log({ createProjectInput });
      const result = await API.graphql(
        graphqlOperation(createProject, { input: createProjectInput })
      );
      setProject(result.data.createProject);
      console.log({ result });
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <div className="max-w-lg mx-auto my-auto h-full flex flex-col justify-center">
      <h2 className="text-lg font-medium text-white">
        Create your first project
      </h2>
      <p className="mt-1 text-sm text-gray-200">
        Get started by selecting a template or start from an empty project.
      </p>
      <ul
        role="list"
        className="mt-6 border-t border-b border-gray-200 divide-y divide-gray-200"
      >
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="relative group py-4 flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span
                  className={
                    "bg-yellow-600 z-60 inline-flex items-center justify-center h-10 w-10 rounded-lg"
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
                  <span className="text-sm text-yellow-600 ml-2">
                    Coming Soon!
                  </span>
                </div>
                <p className="text-sm text-gray-200">{item.description}</p>
              </div>
              <div className="flex-shrink-0 self-center">
                <ChevronRightIcon
                  className="h-5 w-5 text-gray-200 group-hover:text-gray-200"
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
