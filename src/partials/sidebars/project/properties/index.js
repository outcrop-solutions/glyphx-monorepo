import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { Property } from "./Property";
import { useProperties } from "../../../../services/useProperties";
import { PropDrop } from "./PropDrop";
import { Columns } from "../../../datagrid/columns";

export const Properties = ({
  project,
  sidebarExpanded,
  setSidebarExpanded,
  isEditing,
  modelProps,
  setModelProps,
}) => {
  const [open, setOpen] = useState(isEditing ? true : false);
  const [isOver, setIsOver] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (isEditing) {
      setSidebarExpanded(true);
      setOpen(true);
    } else {
      setSidebarExpanded(false);
      setOpen(false);
    }
  }, [isEditing]);
  const [propertiesArr, setPropertiesArr] = useState([]);
  const { properties } = useProperties(project);
  useEffect(() => {
    if (properties)
      setPropertiesArr([properties.x, properties.y, properties.z]);
  }, [properties]);
  return (
    <React.Fragment>
      <Header
        open={open}
        handleClick={handleClick}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />
      <div
        className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2 -mt-2 ${
          !open && sidebarExpanded
            ? "border-0 -my-2"
            : "border-b border-gray-400"
        }`}
      >
        <ul className={`pl-2 h-44 my-4 ${!open && "hidden"}`}>
          {/* {Object.keys(modelProps.propMap).map((key, index) => {
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
					})} */}

          {/* <PropDrop modelProps={modelProps} setModelProps={setModelProps} /> */}

          {/* {isEditing ? ( 
					// ) : (
					// 	<>
					// 		{propertiesArr.length > 0
					// 			? propertiesArr.map((item, idx) => (
					// 					<Property key={item} item={item} idx={idx} />
					// 			  ))
					// 			: null}
					// 	</>
					// )} */}
        </ul>
      </div>
    </React.Fragment>
  );
};

export default Properties;
