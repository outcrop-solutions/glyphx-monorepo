/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
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

  // useEffect(() => {
  //   if (isEditing) {
  //     setSidebarExpanded(true);
  //     setOpen(true);
  //   } else {
  //     setSidebarExpanded(false);
  //     setOpen(false);
  //   }
  // }, [isEditing, setSidebarExpanded]);

  // const { properties } = useProperties(project);
  // useEffect(() => {
  //   if (properties)
  //     setPropertiesArr([properties.x, properties.y, properties.z]);
  //   if (propertiesArr.length === 3) {
  //     //send props to lambda function
  //   }
  // }, [properties, propertiesArr.length]);

  return (
    <React.Fragment>
      <Header
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

{
  /* {Object.keys(modelProps.propMap).map((key, index) => {
						if (key !== 'columnHeaders') {
							return (
								<Columns
									key={key}
									listId={key}
									listType='CARD'
									properties={modelProps.propMap[key]}
								/>
							)
						}
					})} */
}

{
  /* <PropDrop modelProps={modelProps} setModelProps={setModelProps} /> */
}

{
  /* {isEditing ? ( 
					// ) : (
					// 	<>
					// 		{propertiesArr.length > 0
					// 			? propertiesArr.map((item, idx) => (
					// 					<Property key={item} item={item} idx={idx} />
					// 			  ))
					// 			: null}
					// 	</>
					// )} */
}
