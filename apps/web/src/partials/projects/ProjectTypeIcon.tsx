import React from 'react';
import DefaultProjectTypeIcon from 'public/svg/default-project-type-icon.svg';

// TODO: reference project type
export const ProjectTypeIcon = ({ project }) => {
  return (
    <div>
      {(() => {
        switch (project.type) {
          default:
            return <DefaultProjectTypeIcon />;
        }
      })()}
    </div>
  );
};
