import { atom, selector } from "recoil";
import { selectedProjectSelector } from "./project";

/**
 * ATOM THAT HOLDS DISPLAY TYPE OF EACH AXIS
 */
export const AxisInterpolationAtom = atom({
  key: "AxisInterpolation",
  default: {
    "X":"LIN",
    "Y":"LIN",
    "Z":"LIN"
  }
})

/**
 * ATOM THAT HOLDS AXIS DIRECTION
 * EITHER ASC OR DESC
 */
export const AxisDirectionAtom = atom({
  key:"AxisDirection",
  default: {
    "X":"ASC",
    "Y":"ASC",
    "Z":"ASC"
  }
})

// selects properties off active project
export const propertiesAtom = atom({
  key: "properties",
  default: selector({
    key: "properties/default",
    get: ({ get }) => {
      let selectedProject = get(selectedProjectSelector);
      if (!selectedProject) return [];
      if (
        selectedProject?.properties &&
        selectedProject?.properties.length > 0
      ) {
        const existingProps = selectedProject?.properties.map((el, idx) => {
          switch (idx) {
            case 0:
              return {
                axis: "X",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 1:
              return {
                axis: "Y",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 2:
              return {
                axis: "Z",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 3:
              return {
                axis: "1",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 4:
              return {
                axis: "2",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 5:
              return {
                axis: "3",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            default:
              break;
          }
        });
        // TODO: ADD LIN/LOG PROPS HERE
        
        return existingProps;
      } else {
        const cleanProps = [
          { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        ];
        return cleanProps;
      }
      // @ts-ignore
    },
  }),
});

// selects the lastItemDropped from the properties array for conveniece
export const droppedPropertiesSelector = selector({
  key: "droppedProperties",
  get: ({ get }) => {
    const properties = get(propertiesAtom);
    // @ts-ignore
    return properties?.filter((item) => item.lastDroppedItem);
  },
});

// selects keys from lastDroppedItems for convenience
export const propsSlicedSelector = selector({
  key: "slicedProperties",
  get: ({ get }) => {
    const properties = get(propertiesAtom);

    if (properties === undefined) return;

    return properties?.slice(0, 3).map((item) => item?.lastDroppedItem?.key);
  },
});

// might not be necessary with new ETL
export const droppedSlicedSelector = selector({
  key: "droppedSlicedProperties",
  get: ({ get }) => {
    const properties = get(droppedPropertiesSelector);
    if (!properties) return;
    else {
      return properties?.slice(0, 3).filter((el) => el);
    }
  },
});

// deep equals utility
const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i].lastDroppedItem.key);

// Boolean to check whether properties payload is valid
export const isPropsValidSelector = selector({
  key: "isPropertiesValid",
  get: ({ get }) => {
    const properties = get(propertiesAtom);
    const propsSliced = get(propsSlicedSelector);
    const droppedSliced = get(droppedSlicedSelector);
    // console.log("Inside isPropsvalidSelector",{properties},{propsSliced},{droppedSliced})
    // console.log({funciton: equals(propsSliced, droppedSliced)})
    if (
      properties &&
      properties.length >= 3 &&
      propsSliced &&
      propsSliced.length >= 3 &&
      droppedSliced &&
      droppedSliced.length >= 3 &&
      equals(propsSliced, droppedSliced) //something up here
    ) {
      return true;
    } else {
      return false;
    }
  },
});

export const isReordering = selector({
  key: "isReordering",
  get: ({ get }) => {
    // TODO: NEW ETL LOGIC NECESSARY
    // if (
    //   oldDropped &&
    //   oldDroppedSliced.length === 3 &&
    //   !equals(propsSliced, oldDroppedSliced)
    // ) {
    //   console.log("Called Reorder Confirm");
    //   setReorderConfirm(true);
    //   return;
    // }
  },
});


// check if z-axis locked to numeric
export const isZnumberSelector = selector({
  key: "isZnumber",
  get: ({ get }) => {
    const properties = get(propertiesAtom);
    if (properties[2]?.lastDroppedItem?.dataType === "number") {
      return true;
    } else {
      return false;
    }
  },
});

// Formatted payload sent to API
export const filterPayloadSelector = selector({
  key: "firstThreeDroppedProperties",
  get: ({ get }) => {
    let properties = get(propertiesAtom);
    // @ts-ignore
    return properties.filter((item) => item.lastDroppedItem);
  },
});

// toggles reorder confirmation modal based on propped properties
export const showReorderConfirmAtom = atom({
  key: "showreorderConfirm",
  default: selector({
    key: "showReorderConfirm/default",
    get: ({ get }) => {
      // TODO: determine if reordering based on property state
    },
  }),
});
