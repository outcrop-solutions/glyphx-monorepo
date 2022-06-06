/* eslint-disable no-lone-blocks */
import React, { useState } from "react";
import { PropertiesHeader } from "./PropertiesHeader";
import { Property } from "./Property";

export const Properties = ({
  project,
  sidebarExpanded,
  setSidebarExpanded,
  isEditing,
  propertiesArr,
  handleDrop,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <PropertiesHeader
        open={open}
        handleClick={handleClick}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />
      <div
        className={`lg:hidden lg:project-sidebar-expanded:block ${
          !open && sidebarExpanded ? "border-0" : "border-b border-gray-400"
        }`}
      >
        <ul className={`${!open && "hidden"}`}>
          {propertiesArr.length > 0
            ? propertiesArr.map(({ axis, accepts, lastDroppedItem }, idx) => {
                if (idx < 3) {
                  return (
                    <Property
                      axis={axis}
                      accept={accepts}
                      lastDroppedItem={lastDroppedItem}
                      onDrop={(item) => handleDrop(idx, item)}
                      key={idx}
                      idx={idx}
                    />
                  );
                } else return null;
              })
            : null}
        </ul>
      </div>
    </React.Fragment>
  );
};

export default Properties;
