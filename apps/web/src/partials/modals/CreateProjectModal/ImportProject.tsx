export default function ImportProject({ exit }) {
  return (
    <div className="px-4 py-5 w-full">
      <div className="flex flex-row items-center justify-between border-b border-b-gray pb-1 mb-5">
        <p className="font-rubik font-normal text-[22px] leading-[26px] tracking-[0.01em] text-white">Import Project</p>
        <svg
          onClick={exit}
          className="border border-transparent hover:border-white hover:cursor-pointer"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.3002 5.71C17.9102 5.32 17.2802 5.32 16.8902 5.71L12.0002 10.59L7.11022 5.7C6.72022 5.31 6.09021 5.31 5.70021 5.7C5.31021 6.09 5.31021 6.72 5.70021 7.11L10.5902 12L5.70021 16.89C5.31021 17.28 5.31021 17.91 5.70021 18.3C6.09021 18.69 6.72022 18.69 7.11022 18.3L12.0002 13.41L16.8902 18.3C17.2802 18.69 17.9102 18.69 18.3002 18.3C18.6902 17.91 18.6902 17.28 18.3002 16.89L13.4102 12L18.3002 7.11C18.6802 6.73 18.6802 6.09 18.3002 5.71Z"
            fill="#CECECE"
          />
        </svg>
      </div>

      <div className="mb-4 mt-4 flex flex-row justify-end items-center">
        <button className="bg-primary-yellow py-2 px-2 font-roboto font-medium text-[14px] leading-[16px] text-secondary-space-blue">
          Import
        </button>
      </div>
    </div>
  );
}
