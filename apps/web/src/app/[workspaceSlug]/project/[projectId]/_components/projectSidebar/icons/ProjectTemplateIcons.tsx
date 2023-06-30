import React from 'react';
import DefaultProjectTemplateIcon from 'public/svg/default-project-type-icon.svg';

// TODO: reference project type
export const ProjectTemplateIcons = ({ project }) => {
  return (
    <div>
      {(() => {
        switch (project.type) {
          default:
            return <DefaultProjectTemplateIcon />;
        }
      })()}
    </div>
  );
};
