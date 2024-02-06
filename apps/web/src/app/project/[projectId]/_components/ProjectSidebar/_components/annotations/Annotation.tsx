'use client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export const Annotation = ({item}) => {
  dayjs.extend(relativeTime);
  return (
    <li
      key={item.id}
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex flex-col cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-4 w-4 rounded-full bg-teal">
            {item.author.name.charAt(0)}
          </div>
          <div className="text-center  whitespace-nowrap truncate ml-2">{item.author.name}</div>
        </div>
        <div className="text-center text-gray whitespace-nowrap truncate ml-2">{dayjs().to(dayjs(item.createdAt))}</div>
      </div>
      <div className="transition duration-150 truncate grow ml-8">
        <span className={`w-full text-left text-light-gray text-sm font-medium`}>{item.value}</span>
      </div>
    </li>
  );
};
