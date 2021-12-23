import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import Project from "../../images/project.png";

import { AddProject } from "./AddProject";

export const ProjectCard = ({
  project,
  setProject,
  updatedAt,
  idx,
  id,
  name,
  link,
  description,
  user,
}) => {
  dayjs.extend(relativeTime);
  useEffect(() => {
    if (idx > 0) console.log(`I'm rendering`);
  }, []);

  const categoryIcon = (category) => {
    switch (category) {
      case "1":
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_944_7114)">
                <rect
                  x="6"
                  y="6"
                  width="16"
                  height="16"
                  rx="2"
                  fill="#FFC500"
                />
              </g>
              <path
                d="M17.965 12.4926L16.165 13.3326L15 12.1676V11.4676L16.165 10.3026L17.965 11.1426C18.155 11.2326 18.375 11.1476 18.465 10.9626C18.555 10.7726 18.47 10.5526 18.285 10.4626L16.325 9.5476C16.135 9.4576 15.91 9.4976 15.76 9.6476L14.89 10.5176C14.8 10.3976 14.66 10.3176 14.5 10.3176C14.225 10.3176 14 10.5426 14 10.8176V11.3176H12.41C12.2 10.7376 11.65 10.3176 11 10.3176C10.17 10.3176 9.5 10.9876 9.5 11.8176C9.5 12.3676 9.8 12.8426 10.24 13.1076L11.54 17.3176H11C10.45 17.3176 10 17.7676 10 18.3176V18.8176H16.5V18.3176C16.5 17.7676 16.05 17.3176 15.5 17.3176H14.69L12.205 12.7026C12.29 12.5826 12.36 12.4576 12.41 12.3176H14V12.8176C14 13.0926 14.225 13.3176 14.5 13.3176C14.66 13.3176 14.8 13.2376 14.89 13.1176L15.76 13.9876C15.91 14.1376 16.135 14.1776 16.325 14.0876L18.285 13.1726C18.475 13.0826 18.555 12.8626 18.465 12.6726C18.375 12.4876 18.155 12.4026 17.965 12.4926ZM11 12.3176C10.725 12.3176 10.5 12.0926 10.5 11.8176C10.5 11.5426 10.725 11.3176 11 11.3176C11.275 11.3176 11.5 11.5426 11.5 11.8176C11.5 12.0926 11.275 12.3176 11 12.3176ZM13.555 17.3176H12.585L11.355 13.3176H11.405L13.555 17.3176Z"
                fill="white"
              />
              <defs>
                <filter
                  id="filter0_d_944_7114"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="3" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.105882 0 0 0 0 0.12549 0 0 0 0 0.227451 0 0 0 0.15 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_944_7114"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_944_7114"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        );
      case "2":
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_944_7114)">
                <rect
                  x="6"
                  y="6"
                  width="16"
                  height="16"
                  rx="2"
                  fill="#FFC500"
                />
              </g>
              <path
                d="M17.965 12.4926L16.165 13.3326L15 12.1676V11.4676L16.165 10.3026L17.965 11.1426C18.155 11.2326 18.375 11.1476 18.465 10.9626C18.555 10.7726 18.47 10.5526 18.285 10.4626L16.325 9.5476C16.135 9.4576 15.91 9.4976 15.76 9.6476L14.89 10.5176C14.8 10.3976 14.66 10.3176 14.5 10.3176C14.225 10.3176 14 10.5426 14 10.8176V11.3176H12.41C12.2 10.7376 11.65 10.3176 11 10.3176C10.17 10.3176 9.5 10.9876 9.5 11.8176C9.5 12.3676 9.8 12.8426 10.24 13.1076L11.54 17.3176H11C10.45 17.3176 10 17.7676 10 18.3176V18.8176H16.5V18.3176C16.5 17.7676 16.05 17.3176 15.5 17.3176H14.69L12.205 12.7026C12.29 12.5826 12.36 12.4576 12.41 12.3176H14V12.8176C14 13.0926 14.225 13.3176 14.5 13.3176C14.66 13.3176 14.8 13.2376 14.89 13.1176L15.76 13.9876C15.91 14.1376 16.135 14.1776 16.325 14.0876L18.285 13.1726C18.475 13.0826 18.555 12.8626 18.465 12.6726C18.375 12.4876 18.155 12.4026 17.965 12.4926ZM11 12.3176C10.725 12.3176 10.5 12.0926 10.5 11.8176C10.5 11.5426 10.725 11.3176 11 11.3176C11.275 11.3176 11.5 11.5426 11.5 11.8176C11.5 12.0926 11.275 12.3176 11 12.3176ZM13.555 17.3176H12.585L11.355 13.3176H11.405L13.555 17.3176Z"
                fill="white"
              />
              <defs>
                <filter
                  id="filter0_d_944_7114"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="3" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.105882 0 0 0 0 0.12549 0 0 0 0 0.227451 0 0 0 0.15 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_944_7114"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_944_7114"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        );

      default:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_944_7114)">
                <rect
                  x="6"
                  y="6"
                  width="16"
                  height="16"
                  rx="2"
                  fill="#FFC500"
                />
              </g>
              <path
                d="M17.965 12.4926L16.165 13.3326L15 12.1676V11.4676L16.165 10.3026L17.965 11.1426C18.155 11.2326 18.375 11.1476 18.465 10.9626C18.555 10.7726 18.47 10.5526 18.285 10.4626L16.325 9.5476C16.135 9.4576 15.91 9.4976 15.76 9.6476L14.89 10.5176C14.8 10.3976 14.66 10.3176 14.5 10.3176C14.225 10.3176 14 10.5426 14 10.8176V11.3176H12.41C12.2 10.7376 11.65 10.3176 11 10.3176C10.17 10.3176 9.5 10.9876 9.5 11.8176C9.5 12.3676 9.8 12.8426 10.24 13.1076L11.54 17.3176H11C10.45 17.3176 10 17.7676 10 18.3176V18.8176H16.5V18.3176C16.5 17.7676 16.05 17.3176 15.5 17.3176H14.69L12.205 12.7026C12.29 12.5826 12.36 12.4576 12.41 12.3176H14V12.8176C14 13.0926 14.225 13.3176 14.5 13.3176C14.66 13.3176 14.8 13.2376 14.89 13.1176L15.76 13.9876C15.91 14.1376 16.135 14.1776 16.325 14.0876L18.285 13.1726C18.475 13.0826 18.555 12.8626 18.465 12.6726C18.375 12.4876 18.155 12.4026 17.965 12.4926ZM11 12.3176C10.725 12.3176 10.5 12.0926 10.5 11.8176C10.5 11.5426 10.725 11.3176 11 11.3176C11.275 11.3176 11.5 11.5426 11.5 11.8176C11.5 12.0926 11.275 12.3176 11 12.3176ZM13.555 17.3176H12.585L11.355 13.3176H11.405L13.555 17.3176Z"
                fill="white"
              />
              <defs>
                <filter
                  id="filter0_d_944_7114"
                  x="0"
                  y="0"
                  width="28"
                  height="28"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="3" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.105882 0 0 0 0 0.12549 0 0 0 0 0.227451 0 0 0 0.15 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_944_7114"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_944_7114"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-lg border border-opacity-50 border-gray-200">
      <div onClick={() => setProject(project)} className="flex flex-col h-full">
        <img className="w-full h-full rounded-t-md" src={Project} />
        <footer className="mt-2 px-5 pb-5 pt-1">
          <div className="text-sm font-medium text-white mb-2">{name}</div>
          <div className="flex justify-between items-center">
            <div className="flex flex-shrink-0 -space-x-3 -ml-px">
              {project.shared && project.shared.length > 0 ? (
                <>
                  {project.shared.map((member, idx) => {
                    if (idx < 4) {
                      return (
                        <div
                          className={`rounded-full ${
                            idx % 2 === 0 ? "bg-blue-600" : "bg-yellow-400"
                          } h-8 w-8 text-sm text-white flex items-center justify-center`}
                        >
                          {`${member.split("@")[0][0].toUpperCase()}`}
                        </div>
                      );
                    }
                  })}
                </>
              ) : (
                <div className="rounded-full bg-blue-600 h-8 w-8 text-sm text-white flex items-center justify-center">
                  {`${user.attributes.email.split("@")[0][0].toUpperCase()}`}
                </div>
              )}
              {project.shared && project.shared.length > 4 ? (
                <div>{`+ ${project.shared.length - 3} more`}</div>
              ) : null}
            </div>
            <div>
              <Link
                className="text-sm font-medium text-gray-50 opacity-40"
                to={link}
              >
                {dayjs().to(dayjs(updatedAt))}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProjectCard;
