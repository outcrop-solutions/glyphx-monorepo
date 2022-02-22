import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";

const user = {
  name: "Bryan Holster",
  email: "bryan@synglyphx.com",
  imageUrl: "/bryan.jpg",
};
const navigation = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Billing", href: "#", current: false },
  { name: "Communications", href: "#", current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const people = [
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  },
  {
    name: "Jane Cooper",
    city: "Indianapolis",
    invoice: "Sept 20th, 2021",
    models: "6",
    received: "$20,000",
  }
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Dashboard = () => {
  return (
    <div className="h-screen bg-primary-dark-blue">
      <div className="h-screen">
        <div className="min-h-full">
          <Disclosure as="nav" className="bg-primary-dark-blue shadow-sm">
            {({ open }) => (
              <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <img
                          className="block w-auto"
                          src="/logo-large.svg"
                          alt="Workflow"
                        />
                      </div>
                      <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "border-indigo-500 text-white"
                                : "border-transparent text-gray-200 hover:text-gray-700 hover:border-gray-300",
                              "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                      <button
                        type="button"
                        className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={user.imageUrl}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    href={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <MenuIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="sm:hidden">
                  <div className="pt-2 pb-3 space-y-1">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                          "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.imageUrl}
                          alt=""
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-200">
                          {user.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block px-4 py-2 text-base font-medium text-gray-200 hover:text-gray-800 hover:bg-gray-100"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>

          <div className="py-10">
            <header className="mb-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold leading-tight text-white">
                  Dashboard
                </h1>
              </div>
            </header>
            <main>
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-800 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-800">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                City
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Last Invoice
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Total Models
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider"
                              >
                                Receivables
                              </th>
                              <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Edit</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-200">
                            {people.map((person) => (
                              <tr key={person.email}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                                  {person.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.invoice}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.models}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                  {person.received}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <a
                                    href="#"
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
