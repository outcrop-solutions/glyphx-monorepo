import { DotsVerticalIcon } from "@heroicons/react/solid";

const projects = [
  {
    name: "Shipping Send by SKU",
    initials: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="4" fill="#0058D8" />
        <path
          d="M24 12H21V8H7C5.9 8 5 8.9 5 10V21H7C7 22.66 8.34 24 10 24C11.66 24 13 22.66 13 21H19C19 22.66 20.34 24 22 24C23.66 24 25 22.66 25 21H27V16L24 12ZM23.5 13.5L25.46 16H21V13.5H23.5ZM10 22C9.45 22 9 21.55 9 21C9 20.45 9.45 20 10 20C10.55 20 11 20.45 11 21C11 21.55 10.55 22 10 22ZM12.22 19C11.67 18.39 10.89 18 10 18C9.11 18 8.33 18.39 7.78 19H7V10H19V19H12.22ZM22 22C21.45 22 21 21.55 21 21C21 20.45 21.45 20 22 20C22.55 20 23 20.45 23 21C23 21.55 22.55 22 22 22Z"
          fill="white"
        />
      </svg>
    ),
    href: "#",
    derivatives: 0,
    bgColor: "transparent",
  },
  {
    name: "Logistics by Distribution center",
    initials: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="4" fill="#0058D8" />
        <path
          d="M24 6H8C7 6 6 6.9 6 8V11.01C6 11.73 6.43 12.35 7 12.7V24C7 25.1 8.1 26 9 26H23C23.9 26 25 25.1 25 24V12.7C25.57 12.35 26 11.73 26 11.01V8C26 6.9 25 6 24 6ZM23 24H9V13H23V24ZM24 11H8V8H24V11Z"
          fill="white"
        />
        <path d="M19 16H13V18H19V16Z" fill="white" />
      </svg>
    ),
    href: "#",
    derivatives: 0,
    bgColor: "transparent",
  },
  {
    name: "Inventory Count by Warehouse",
    initials: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="4" fill="#0058D8" />
        <path
          d="M8 10H10V13H20V10H22V15H24V10C24 8.9 23.1 8 22 8H17.82C17.4 6.84 16.3 6 15 6C13.7 6 12.6 6.84 12.18 8H8C6.9 8 6 8.9 6 10V24C6 25.1 6.9 26 8 26H14V24H8V10ZM15 8C15.55 8 16 8.45 16 9C16 9.55 15.55 10 15 10C14.45 10 14 9.55 14 9C14 8.45 14.45 8 15 8Z"
          fill="white"
        />
        <path
          d="M24 16.5L18.51 22L15.5 19L14 20.5L18.51 25L25.5 18L24 16.5Z"
          fill="white"
        />
      </svg>
    ),
    href: "#",
    derivatives: 0,
    bgColor: "transparent",
  },
  {
    name: "Purchasing by Raw Material",
    initials: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="4" fill="#00C6B1" />
        <path
          d="M25 11.28V9C25 7.9 24.1 7 23 7H9C7.89 7 7 7.9 7 9V23C7 24.1 7.89 25 9 25H23C24.1 25 25 24.1 25 23V20.72C25.59 20.37 26 19.74 26 19V13C26 12.26 25.59 11.63 25 11.28ZM24 13V19H17V13H24ZM9 23V9H23V11H17C15.9 11 15 11.9 15 13V19C15 20.1 15.9 21 17 21H23V23H9Z"
          fill="white"
        />
      </svg>
    ),
    href: "#",
    derivatives: 8,
    bgColor: "transparent",
  },
  {
    name: "Manufacturing Production by Raw Facility",
    initials: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="4" fill="#FFC500" />
        <path
          d="M23.93 12.9852L20.33 14.6652L18 12.3352V10.9352L20.33 8.60519L23.93 10.2852C24.31 10.4652 24.75 10.2952 24.93 9.92519C25.11 9.54519 24.94 9.10519 24.57 8.92519L20.65 7.09519C20.27 6.91519 19.82 6.99519 19.52 7.29519L17.78 9.03519C17.6 8.79519 17.32 8.63519 17 8.63519C16.45 8.63519 16 9.08519 16 9.63519V10.6352H12.82C12.4 9.47519 11.3 8.63519 10 8.63519C8.34 8.63519 7 9.97519 7 11.6352C7 12.7352 7.6 13.6852 8.48 14.2152L11.08 22.6352H10C8.9 22.6352 8 23.5352 8 24.6352V25.6352H21V24.6352C21 23.5352 20.1 22.6352 19 22.6352H17.38L12.41 13.4052C12.58 13.1652 12.72 12.9152 12.82 12.6352H16V13.6352C16 14.1852 16.45 14.6352 17 14.6352C17.32 14.6352 17.6 14.4752 17.78 14.2352L19.52 15.9752C19.82 16.2752 20.27 16.3552 20.65 16.1752L24.57 14.3452C24.95 14.1652 25.11 13.7252 24.93 13.3452C24.75 12.9752 24.31 12.8052 23.93 12.9852ZM10 12.6352C9.45 12.6352 9 12.1852 9 11.6352C9 11.0852 9.45 10.6352 10 10.6352C10.55 10.6352 11 11.0852 11 11.6352C11 12.1852 10.55 12.6352 10 12.6352ZM15.11 22.6352H13.17L10.71 14.6352H10.81L15.11 22.6352Z"
          fill="white"
        />
      </svg>
    ),
    href: "#",
    derivatives: 8,
    bgColor: "transparent",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const PinnedProjects = () => {
  return (
    <div className="pt-8 mb-8">
      <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">
        Pinned templates
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <li
            key={project.name}
            className="col-span-1 flex shadow-sm rounded-md"
          >
            <div
              className={classNames(
                project.bgColor,
                "flex-shrink-0 flex border-t border-l border-b border-gray-400 items-center justify-center w-16 text-white text-sm font-medium rounded-l-md "
              )}
            >
              {project.initials}
            </div>
            <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-400  rounded-r-md truncate">
              <div className="flex-1 px-4 py-2 text-sm truncate">
                <a
                  href={project.href}
                  className="text-gray-100 font-medium hover:text-gray-600"
                >
                  {project.name}
                </a>
                <p className="text-gray-500">
                  {project.derivatives} Derivative Projects
                </p>
              </div>
              <div className="flex-shrink-0 pr-2">
                <button
                  type="button"
                  className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Open options</span>
                  <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
