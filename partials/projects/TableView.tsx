import dayjs from "dayjs";
import { useRouter } from "next/router";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRecoilValue } from "recoil";
import { projectsSelector } from "@/state/globals";
import { userSelector } from "@/state/user";

export const TableView = () => {
  const router = useRouter();
  const projects = useRecoilValue(projectsSelector);
  const user = useRecoilValue(userSelector(userData));
  
  dayjs.extend(relativeTime);
  return (
    <div className="text-white rounded-sm">
      <div className="px-1">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <div className="ml-2 text-lg text-gray">
              Recently Used Templates
            </div>
            {/* Table header */}
            <thead className="text-xs uppercase text-gray opacity-60 rounded-sm">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Name</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Owner</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Shared With</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Last Modified</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">File Size</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm">
              {/* Row */}
              {projects.map((item, idx) => (
                <tr
                  className="group hover:bg-gray"
                  onClick={() => router.push(`/project/${item.id}`)}
                >
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-white cursor-pointer">
                        {item.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap truncate w-20">
                    <div className="flex items-center">
                      <div>{item.author === user.id ? "Me" : item.author}</div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex shrink-0 -space-x-3 -ml-px">
                      {item.shared && item.shared.length > 0 ? (
                        <>
                          {item.shared.map((el) => (
                            <a className="block" href="#0">
                              <div
                                className={`rounded-full ${
                                  idx % 2 === 0
                                    ? "bg-blue-600"
                                    : "bg-yellow"
                                } h-8 w-8 text-sm text-white flex items-center justify-center`}
                              >
                                {`${el.split("@")[0][0].toUpperCase()}`}
                              </div>
                            </a>
                          ))}
                        </>
                      ) : (
                        <div className="flex items-center">
                          <div className="font-medium text-white cursor-pointer">
                            None
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-white cursor-pointer">
                        {dayjs().to(dayjs(item.updatedAt))}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-center">00.00MB</div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="hidden group-hover:flex items-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.88889 18.2222C6.88889 19.2 7.68889 20 8.66667 20H15.7778C16.7556 20 17.5556 19.2 17.5556 18.2222V9.33333C17.5556 8.35556 16.7556 7.55556 15.7778 7.55556H8.66667C7.68889 7.55556 6.88889 8.35556 6.88889 9.33333V18.2222ZM9.55556 9.33333H14.8889C15.3778 9.33333 15.7778 9.73333 15.7778 10.2222V17.3333C15.7778 17.8222 15.3778 18.2222 14.8889 18.2222H9.55556C9.06667 18.2222 8.66667 17.8222 8.66667 17.3333V10.2222C8.66667 9.73333 9.06667 9.33333 9.55556 9.33333ZM15.3333 4.88889L14.7022 4.25778C14.5422 4.09778 14.3111 4 14.08 4H10.3644C10.1333 4 9.90222 4.09778 9.74222 4.25778L9.11111 4.88889H6.88889C6.4 4.88889 6 5.28889 6 5.77778C6 6.26667 6.4 6.66667 6.88889 6.66667H17.5556C18.0444 6.66667 18.4444 6.26667 18.4444 5.77778C18.4444 5.28889 18.0444 4.88889 17.5556 4.88889H15.3333Z"
                          fill="white"
                        />
                      </svg>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.1818 11.8182C15.7891 11.8182 17.0909 10.5164 17.0909 8.90909C17.0909 7.30182 15.7891 6 14.1818 6C12.5745 6 11.2727 7.30182 11.2727 8.90909C11.2727 10.5164 12.5745 11.8182 14.1818 11.8182ZM7.63636 10.3636V8.90909C7.63636 8.50909 7.30909 8.18182 6.90909 8.18182C6.50909 8.18182 6.18182 8.50909 6.18182 8.90909V10.3636H4.72727C4.32727 10.3636 4 10.6909 4 11.0909C4 11.4909 4.32727 11.8182 4.72727 11.8182H6.18182V13.2727C6.18182 13.6727 6.50909 14 6.90909 14C7.30909 14 7.63636 13.6727 7.63636 13.2727V11.8182H9.09091C9.49091 11.8182 9.81818 11.4909 9.81818 11.0909C9.81818 10.6909 9.49091 10.3636 9.09091 10.3636H7.63636ZM14.1818 13.2727C12.24 13.2727 8.36364 14.2473 8.36364 16.1818V16.9091C8.36364 17.3091 8.69091 17.6364 9.09091 17.6364H19.2727C19.6727 17.6364 20 17.3091 20 16.9091V16.1818C20 14.2473 16.1236 13.2727 14.1818 13.2727Z"
                          fill="white"
                        />
                      </svg>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.2 8H12.8V9.6H11.2V8ZM11.2 11.2H12.8V16H11.2V11.2ZM12 4C7.584 4 4 7.584 4 12C4 16.416 7.584 20 12 20C16.416 20 20 16.416 20 12C20 7.584 16.416 4 12 4ZM12 18.4C8.472 18.4 5.6 15.528 5.6 12C5.6 8.472 8.472 5.6 12 5.6C15.528 5.6 18.4 8.472 18.4 12C18.4 15.528 15.528 18.4 12 18.4Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
