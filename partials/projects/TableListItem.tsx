import { usernameSelector } from "@/state/user";
import { useRecoilValue } from "recoil";
import { useRouter } from 'next/router'
import Link from 'next/link'

export function TableListItem({ projectDetails }) {

    const user = useRecoilValue(usernameSelector);
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const router = useRouter()

    /**
     * Send user to project
     */
    function handleClick(){
        console.log({projectDetails});
        router.push(`project/${projectDetails.id}`)
    }

    function handleShareClicked(){
        console.log("share clicked")
    }

    return (
        <div onClick={handleClick}  className="flex flex-row justify-between items-center bg-secondary-space-blue rounded py-2 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white">
            
                
                <p title="Project Name" className="w-40">{projectDetails.name}</p>
            {/* @ts-ignore */}
            <p title="Last Updated" className="w-40">{new Date(projectDetails.updatedAt).toLocaleDateString('en-US', dateOptions)}</p>
            <p title="Owner">{projectDetails.author === user ? "Me" : projectDetails.author}</p>
            <div className="flex shrink-0 -space-x-2 -ml-px mr-2">
            {projectDetails.shared.map((member, idx) => {
                if (idx < 3) {
                    return (
                        <div
                            title="Shared With"
                            key={`${member}-${idx}`}
                            className={`rounded-full ${idx % 2 === 0 ? "bg-blue" : "bg-primary-yellow"
                                } h-4 w-4 font-roboto font-medium text-[12px] leading-[14px] tracking-[0.01em] text-white flex items-center justify-center`}
                        >
                            {`${member.split("@")[0][0].toUpperCase()}`}
                        </div>
                    );
                }
            })}
            </div>
            
            <p title="Data Usage">00.00 MB</p>
          
            
           
            
            <div className="flex flex-row items-center space-x-1">
                {/* add member */}
                <svg
                    //   onClick={() => setProjectDetails(project)}
                    onClick={handleShareClicked}
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="border border-transparent hover:border-white"
                >
                    <path
                        d="M14.1818 12.3182C15.7891 12.3182 17.0909 11.0164 17.0909 9.40909C17.0909 7.80182 15.7891 6.5 14.1818 6.5C12.5745 6.5 11.2727 7.80182 11.2727 9.40909C11.2727 11.0164 12.5745 12.3182 14.1818 12.3182ZM7.63636 10.8636V9.40909C7.63636 9.00909 7.30909 8.68182 6.90909 8.68182C6.50909 8.68182 6.18182 9.00909 6.18182 9.40909V10.8636H4.72727C4.32727 10.8636 4 11.1909 4 11.5909C4 11.9909 4.32727 12.3182 4.72727 12.3182H6.18182V13.7727C6.18182 14.1727 6.50909 14.5 6.90909 14.5C7.30909 14.5 7.63636 14.1727 7.63636 13.7727V12.3182H9.09091C9.49091 12.3182 9.81818 11.9909 9.81818 11.5909C9.81818 11.1909 9.49091 10.8636 9.09091 10.8636H7.63636ZM14.1818 13.7727C12.24 13.7727 8.36364 14.7473 8.36364 16.6818V17.4091C8.36364 17.8091 8.69091 18.1364 9.09091 18.1364H19.2727C19.6727 18.1364 20 17.8091 20 17.4091V16.6818C20 14.7473 16.1236 13.7727 14.1818 13.7727Z"
                        fill="white"
                    />
                </svg>
                {/* info button */}
                <svg
                    //   onClick={() => setProjectDetails(project)}
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="border border-transparent hover:border-white"
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
                    className="border border-transparent hover:border-white"
                //   onClick={handleDelete}
                >
                    <path
                        d="M6.88889 18.7222C6.88889 19.7 7.68889 20.5 8.66667 20.5H15.7778C16.7556 20.5 17.5556 19.7 17.5556 18.7222V9.83333C17.5556 8.85556 16.7556 8.05556 15.7778 8.05556H8.66667C7.68889 8.05556 6.88889 8.85556 6.88889 9.83333V18.7222ZM9.55556 9.83333H14.8889C15.3778 9.83333 15.7778 10.2333 15.7778 10.7222V17.8333C15.7778 18.3222 15.3778 18.7222 14.8889 18.7222H9.55556C9.06667 18.7222 8.66667 18.3222 8.66667 17.8333V10.7222C8.66667 10.2333 9.06667 9.83333 9.55556 9.83333ZM15.3333 5.38889L14.7022 4.75778C14.5422 4.59778 14.3111 4.5 14.08 4.5H10.3644C10.1333 4.5 9.90222 4.59778 9.74222 4.75778L9.11111 5.38889H6.88889C6.4 5.38889 6 5.78889 6 6.27778C6 6.76667 6.4 7.16667 6.88889 7.16667H17.5556C18.0444 7.16667 18.4444 6.76667 18.4444 6.27778C18.4444 5.78889 18.0444 5.38889 17.5556 5.38889H15.3333Z"
                        fill="white"
                    />
                </svg>

            </div>
        </div>
    );
}
