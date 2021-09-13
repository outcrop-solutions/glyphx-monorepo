import React, { useState } from 'react';

function ProjectLinkGroup({
  children,
  activecondition,
}) {

  const [open, setOpen] = useState(activecondition);

  const handleClick = () => {
    setOpen(!open);
  }

  return (
    <li className={`rounded-sm last:mb-0 bg-transparent ${activecondition && 'bg-gray-900'}`}>
      {children(handleClick, open)}
    </li>
  );
}

export default ProjectLinkGroup;