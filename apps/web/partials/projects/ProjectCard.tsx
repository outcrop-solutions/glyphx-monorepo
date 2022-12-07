import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { API, Storage } from "aws-amplify";
import * as mutations from "apps/graphql/mutations";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { projectsAtom } from "@/state/globals";
import { projectDetailsAtom } from "@/state/project";

export const ProjectCard = ({ project, updatedAt, name, idx }) => {
  const router = useRouter();
  dayjs.extend(relativeTime);
  const setProjects = useSetRecoilState(projectsAtom);
  const setProjectDetails = useSetRecoilState(projectDetailsAtom);

  const handleDelete = async () => {
    const projectDelete = {
      id: project.id,
    };

    setProjects((prev) => {
      let newData = prev.filter((proj) => proj.id !== project.id);
      return newData;
    });

    await API.graphql({
      query: mutations.deleteProject,
      variables: { input: projectDelete },
    });

    const s3Data = await Storage.list(`${project.id}/`);
    if (s3Data && s3Data.length > 0) {
      for (let i = 0; i < s3Data.length; i++) {
        await Storage.remove(`${s3Data[i].key}`);
      }
    }
  };

  return (
    // -z-60
    <div className="group relative col-span-full sm:col-span-4 xl:col-span-3 shadow-lg rounded-lg bg-secondary-space-blue hover:cursor-pointer">
      <div className="absolute top-0 left-0">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1066_1184)">
            <rect x="6" y="6" width="16" height="16" rx="2" fill="#FFC500" />
          </g>
          <path
            d="M17.965 12.4926L16.165 13.3326L15 12.1676V11.4676L16.165 10.3026L17.965 11.1426C18.155 11.2326 18.375 11.1476 18.465 10.9626C18.555 10.7726 18.47 10.5526 18.285 10.4626L16.325 9.5476C16.135 9.4576 15.91 9.4976 15.76 9.6476L14.89 10.5176C14.8 10.3976 14.66 10.3176 14.5 10.3176C14.225 10.3176 14 10.5426 14 10.8176V11.3176H12.41C12.2 10.7376 11.65 10.3176 11 10.3176C10.17 10.3176 9.5 10.9876 9.5 11.8176C9.5 12.3676 9.8 12.8426 10.24 13.1076L11.54 17.3176H11C10.45 17.3176 10 17.7676 10 18.3176V18.8176H16.5V18.3176C16.5 17.7676 16.05 17.3176 15.5 17.3176H14.69L12.205 12.7026C12.29 12.5826 12.36 12.4576 12.41 12.3176H14V12.8176C14 13.0926 14.225 13.3176 14.5 13.3176C14.66 13.3176 14.8 13.2376 14.89 13.1176L15.76 13.9876C15.91 14.1376 16.135 14.1776 16.325 14.0876L18.285 13.1726C18.475 13.0826 18.555 12.8626 18.465 12.6726C18.375 12.4876 18.155 12.4026 17.965 12.4926ZM11 12.3176C10.725 12.3176 10.5 12.0926 10.5 11.8176C10.5 11.5426 10.725 11.3176 11 11.3176C11.275 11.3176 11.5 11.5426 11.5 11.8176C11.5 12.0926 11.275 12.3176 11 12.3176ZM13.555 17.3176H12.585L11.355 13.3176H11.405L13.555 17.3176Z"
            fill="white"
          />
          <defs>
            <filter
              id="filter0_d_1066_1184"
              x="0"
              y="0"
              width="28"
              height="28"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
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
                result="effect1_dropShadow_1066_1184"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1066_1184"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="hidden absolute top-0 right-0 group-hover:flex bg-primary-dark-blue items-center justify-between p-2 rounded-md rounded-tl-none rounded-br-none">
        {/* add member */}
        <svg
          onClick={() => setProjectDetails(project)}
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.1818 12.3182C15.7891 12.3182 17.0909 11.0164 17.0909 9.40909C17.0909 7.80182 15.7891 6.5 14.1818 6.5C12.5745 6.5 11.2727 7.80182 11.2727 9.40909C11.2727 11.0164 12.5745 12.3182 14.1818 12.3182ZM7.63636 10.8636V9.40909C7.63636 9.00909 7.30909 8.68182 6.90909 8.68182C6.50909 8.68182 6.18182 9.00909 6.18182 9.40909V10.8636H4.72727C4.32727 10.8636 4 11.1909 4 11.5909C4 11.9909 4.32727 12.3182 4.72727 12.3182H6.18182V13.7727C6.18182 14.1727 6.50909 14.5 6.90909 14.5C7.30909 14.5 7.63636 14.1727 7.63636 13.7727V12.3182H9.09091C9.49091 12.3182 9.81818 11.9909 9.81818 11.5909C9.81818 11.1909 9.49091 10.8636 9.09091 10.8636H7.63636ZM14.1818 13.7727C12.24 13.7727 8.36364 14.7473 8.36364 16.6818V17.4091C8.36364 17.8091 8.69091 18.1364 9.09091 18.1364H19.2727C19.6727 18.1364 20 17.8091 20 17.4091V16.6818C20 14.7473 16.1236 13.7727 14.1818 13.7727Z"
            fill="white"
          />
        </svg>
        {/* info button */}
        <svg
          onClick={() => setProjectDetails(project)}
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.2 8.5H12.8V10.1H11.2V8.5ZM11.2 11.7H12.8V16.5H11.2V11.7ZM12 4.5C7.584 4.5 4 8.084 4 12.5C4 16.916 7.584 20.5 12 20.5C16.416 20.5 20 16.916 20 12.5C20 8.084 16.416 4.5 12 4.5ZM12 18.9C8.472 18.9 5.6 16.028 5.6 12.5C5.6 8.972 8.472 6.1 12 6.1C15.528 6.1 18.4 8.972 18.4 12.5C18.4 16.028 15.528 18.9 12 18.9Z"
            fill="white"
          />
        </svg>
        {/* delete button */}
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onClick={handleDelete}
        >
          <path
            d="M6.88889 18.7222C6.88889 19.7 7.68889 20.5 8.66667 20.5H15.7778C16.7556 20.5 17.5556 19.7 17.5556 18.7222V9.83333C17.5556 8.85556 16.7556 8.05556 15.7778 8.05556H8.66667C7.68889 8.05556 6.88889 8.85556 6.88889 9.83333V18.7222ZM9.55556 9.83333H14.8889C15.3778 9.83333 15.7778 10.2333 15.7778 10.7222V17.8333C15.7778 18.3222 15.3778 18.7222 14.8889 18.7222H9.55556C9.06667 18.7222 8.66667 18.3222 8.66667 17.8333V10.7222C8.66667 10.2333 9.06667 9.83333 9.55556 9.83333ZM15.3333 5.38889L14.7022 4.75778C14.5422 4.59778 14.3111 4.5 14.08 4.5H10.3644C10.1333 4.5 9.90222 4.59778 9.74222 4.75778L9.11111 5.38889H6.88889C6.4 5.38889 6 5.78889 6 6.27778C6 6.76667 6.4 7.16667 6.88889 7.16667H17.5556C18.0444 7.16667 18.4444 6.76667 18.4444 6.27778C18.4444 5.78889 18.0444 5.38889 17.5556 5.38889H15.3333Z"
            fill="white"
          />
        </svg>
        
      </div>
      <div
        onClick={() => router.push(`/project/${project.id}`)}
        className="flex flex-col h-full"
      >
        <img className="w-full h-full rounded-t-md" src="/images/project.png" />
        <footer className="mt-2 px-5 pb-5 pt-1">
          <p className="font-roboto font-medium text-sm leading-[16px] text-light-gray mb-2 h-9">{name}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex shrink-0 -space-x-3 -ml-px mr-2">
                {project.shared && project.shared.length > 0 ? (
                  <>
                    {project.shared.map((member, idx) => {
                      if (idx < 3) {
                        return (
                          <div
                            key={`${member}-${idx}`}
                            className={`rounded-full ${
                              idx % 2 === 0 ? "bg-blue" : "bg-primary-yellow"
                            } h-6 w-6 text-sm text-white flex items-center justify-center`}
                          >
                            {`${member.split("@")[0][0]?.toUpperCase()}`}
                          </div>
                        );
                      }
                    })}
                  </>
                ) : (
                  <div
                    className={`rounded-full ${
                      idx % 2 === 0 ? "bg-cyan" : "bg-primary-yellow"
                    } h-6 w-6 font-roboto font-medium text-[12px] leading-[14px] tracking-[0.01em] text-white flex items-center justify-center`}
                  >
                    {project.author ? `${project.author[0].toUpperCase()}` : ""}
                  </div>
                )}
              </div>
              {project.shared && project.shared.length > 4 ? (
                <div className="text-xs">{`+ ${
                  project.shared.length - 3
                } more`}</div>
              ) : null}
            </div>

            <div>
              <p className="font-roboto font-medium text-sm text-gray leading-[16px] text-right">
                  {dayjs().to(dayjs(updatedAt))}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
