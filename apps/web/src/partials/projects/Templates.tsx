import { ChevronRightIcon } from '@heroicons/react/solid';
import { CalendarIcon, SpeakerphoneIcon, TerminalIcon } from '@heroicons/react/outline';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/router';
import { _createDefaultProject, api, useWorkspace } from 'lib/client';
import { useSession } from 'next-auth/react';
const items = [
  {
    name: 'Shipping Send by SKU',
    description: 'Breakdown shipping send by SKU to discover new winners',
    href: '#',
    iconColor: 'bg-pink-500',
    icon: SpeakerphoneIcon,
  },
  {
    name: 'Logistics by Distribution center',
    description: 'Identify efficient cost centers with ease',
    href: '#',
    iconColor: 'bg-purple-500',
    icon: TerminalIcon,
  },
  {
    name: 'Inventory Count by Warehouse',
    description: 'Visualize inventory over time with seasonal trends',
    href: '#',
    iconColor: 'bg-yellow',
    icon: CalendarIcon,
  },
];

export const Templates = () => {
  const router = useRouter();
  const { data: user } = useSession();
  const { data } = useWorkspace();

  // mutations
  const handleCreate = async () => {
    api({
      ..._createDefaultProject(data.workspace._id),
      onSuccess: (data) => {
        router.push(`/project/${data.id}`);
      },
    });
  };
  return (
    <div className="max-w-lg mx-auto h-full flex flex-col pt-40 grow justify-center items-center">
      <div className="text-lg font-medium text-white">Create your first project</div>
      <div className="mt-1 text-sm text-gray">Get started by selecting a template or start from an empty project.</div>
      <ul className="mt-6 border-t border-b border-gray divide-y divide-gray">
        {items.map((item, itemIdx) => (
          <li key={itemIdx}>
            <div className="relative group py-4 flex items-start space-x-3">
              <div className="shrink-0">
                <span className={'bg-yellow z-60 inline-flex items-center justify-center h-10 w-10 rounded-lg'}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">
                  <a href={item.href}>
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.name}
                  </a>
                  <span className="text-sm text-yellow ml-2">Coming Soon!</span>
                </div>
                <p className="text-sm text-gray">{item.description}</p>
              </div>
              <div className="shrink-0 self-center">
                <ChevronRightIcon className="h-5 w-5 text-gray group-hover:text-gray" aria-hidden="true" />
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
