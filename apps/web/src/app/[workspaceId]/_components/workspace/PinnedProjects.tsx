import PinnedIcon from 'public/svg/pinned-icon.svg';
import {TemplatePreviewBtn} from './TemplatePreviewBtn';
import {Initializer} from 'business/src/init';
import {ProjectTemplateService} from 'business/src/services/projectTemplate';

export const PinnedProjects = async () => {
  await Initializer.init();
  const templates = await ProjectTemplateService.getProjectTemplates({});

  return (
    <div className="pt-8 mb-8 relative">
      <p className="font-rubik font-light text-[18px] text-white leading-[21px] tracking-[0.01em]">
        Recently Used Templates
      </p>
      <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {templates &&
          templates.map((template) => (
            <li
              key={template._id?.toString()}
              className="relative group col-span-1 shadow-sm rounded border border-transparent bg-secondary-space-blue hover:cursor-pointer hover:border-white flex items-center justify-between"
            >
              <div className="flex items-center max-w-full">
                <div className="flex items-center justify-center w-16 h-16 text-white">
                  <PinnedIcon />
                </div>
                <div className="font-roboto font-medium text-[14px] leading-[16px] text-light-gray truncate group-hover:text-white">
                  {template.name}
                </div>
              </div>
              <div className="hidden group-hover:flex absolute right-2">
                <TemplatePreviewBtn template={template} />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};
