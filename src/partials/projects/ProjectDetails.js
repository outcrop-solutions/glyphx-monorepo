import Project from "../../images/project.png";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FolderIcon,
  HeartIcon,
  UserCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import { PencilIcon, PlusSmIcon } from "@heroicons/react/solid";
import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";

const tabs = [
  { name: "Info", href: "#", current: true },
  { name: "Activity", href: "#", current: false },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export const ProjectDetails = ({ projectDetails, setProjectDetails }) => {
  const [open, setOpen] = useState(true);
  const [description, setDescription] = useState(projectDetails.desc);
  const [members, setMembers] = useState([]);
  const [chips, setChips] = useState([]);
  const [editShare, setEditShare] = useState(false);

  const handleChip = () => {
    setChips((prev) => {
      setMembers("");
      return [...prev, members];
    });
  };
  const handleDelete = (item) => {
    setChips((prev) => {
      let newChips = [...prev].filter((el) => el !== item);
      return newChips;
    });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-60 scrollbar-none inset-0 overflow-hidden"
        onClose={setOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-96">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-500"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-500"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 left-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                    <button
                      type="button"
                      className="rounded-md text-white-300 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close panel</span>
                      <XIcon
                        onClick={() => setProjectDetails(false)}
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="h-full bg-primary-dark-blue p-8 overflow-y-auto">
                  <div className="pb-16 space-y-6">
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex">
                          <FolderIcon className="h-6 w-6 mr-2" />
                          <h2 className="text-lg font-medium text-white">
                            <span className="sr-only">Details for </span>
                            {projectDetails.name}
                          </h2>
                        </div>
                        <button
                          type="button"
                          className="ml-4 h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                          <PencilIcon className="h-6 w-6" aria-hidden="true" />
                          <span className="sr-only">Favorite</span>
                        </button>
                      </div>

                      <div>
                        <div className="block mb-2">
                          <nav
                            className="relative z-0 rounded-lg shadow flex divide-x divide-gray-200"
                            aria-label="Tabs"
                          >
                            {tabs.map((tab, tabIdx) => (
                              <a
                                key={tab.name}
                                href={tab.href}
                                className={classNames(
                                  tab.current
                                    ? "text-white"
                                    : "text-gray-400 hover:text-gray-500",
                                  tabIdx === 0 ? "rounded-l-lg" : "",
                                  tabIdx === tabs.length - 1
                                    ? "rounded-r-lg"
                                    : "",
                                  "group relative min-w-0 flex-1 overflow-hidden bg-gray-800 py-2 px-3 text-sm font-medium text-center hover:bg-gray-50 focus:z-10"
                                )}
                                aria-current={tab.current ? "page" : undefined}
                              >
                                <span>{tab.name}</span>
                                <span
                                  aria-hidden="true"
                                  className={classNames(
                                    tab.current
                                      ? "bg-indigo-500"
                                      : "bg-transparent",
                                    "absolute inset-x-0 bottom-0 h-0.5"
                                  )}
                                />
                              </a>
                            ))}
                          </nav>
                        </div>
                      </div>

                      <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                        <img src={Project} alt="" className="object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Information</h3>
                      <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-white mr-2">Owner</dt>
                          <dd className="text-gray-300 truncate">
                            {projectDetails.author}
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-white">Created</dt>
                          <dd className="text-gray-300">
                            {dayjs().to(dayjs(projectDetails.createdAt))}
                          </dd>
                        </div>
                        <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-white">Last modified</dt>
                          <dd className="text-gray-300">
                            {dayjs().to(dayjs(projectDetails.updatedAt))}
                          </dd>
                        </div>
                        {/* <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-white">Dimensions</dt>
                          <dd className="text-white">4032 x 3024</dd>
                        </div>
                        <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-white">Resolution</dt>
                          <dd className="text-white">72 x 72</dd>
                        </div> */}
                      </dl>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Description</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-white italic">
                          {projectDetails.description}
                        </p>
                        <button
                          type="button"
                          className="-mr-2 h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Add description</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Shared with</h3>
                        <li
                          onClick={() => setEditShare((prev) => !prev)}
                          className="py-2 flex justify-between items-center"
                        >
                          <button
                            type="button"
                            className="group -ml-1 bg-gray-800 p-1 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            {/* <span className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-white"> */}
                            {editShare ? (
                              <XIcon className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <PlusSmIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            )}
                            {/* </span> */}
                          </button>
                        </li>
                      </div>
                      <ul
                        role="list"
                        className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200"
                      >
                        <li className="py-3 flex justify-between items-center">
                          {projectDetails.shared.map((member, idx) => (
                            <div
                              className="flex justify-between w-full"
                              key={`${member}-${idx}`}
                            >
                              <div className="flex items-center">
                                <UserCircleIcon className="w-8 h-8 rounded-full" />
                                <p className="ml-4 text-sm font-medium text-white truncate w-24">
                                  {member}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(member)}
                                type="button"
                                className="ml-6 bg-gray-800 rounded-md text-sm font-medium text-white hover:text-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yelloy-500"
                              >
                                Remove
                                <span className="sr-only">{member}</span>
                              </button>
                            </div>
                          ))}
                        </li>
                      </ul>
                      {editShare ? (
                        <div
                          className="mt-3"
                          onKeyPress={(ev) => {
                            if (ev.key === "Enter") {
                              ev.preventDefault();
                              handleChip();
                            }
                          }}
                        >
                          <div className="flex overflow-x-auto scrollbar-none mb-4">
                            {chips.map((item, idx) => (
                              <span
                                key={`${item}-${idx}`}
                                className="px-2 py-1 rounded-full text-gray-500 border border-gray-300 font-semibold text-xs flex align-center cursor-pointer active:bg-gray-300 transition duration-300 ease"
                              >
                                {item}
                                <button className="bg-transparent hover focus:outline-none">
                                  <svg
                                    onClick={() => handleDelete(item)}
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fas"
                                    data-icon="times"
                                    className="svg-inline--fa fa-times w-2 ml-1"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 352 512"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
                                    ></path>
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={members}
                            onChange={(e) => setMembers(e.target.value)}
                            // autoComplete="email"
                            // placeholder="Client email"
                            className="mt-1 rounded-sm block w-full border-px bg-gray-800 border-gray-500 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      ) : null}
                      <div className="mt-2 text-center bg-yellow-600 rounded-lg text-black font-bold px-2 py-1 w-20 hover:text-gray-900">
                        Save
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
