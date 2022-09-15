import { selector } from "recoil";
import { selectedProjectSelector } from "./project";

export const propertiesSelector = selector({
  key: "properties",
  get: ({ get }) => {
    let selectedProject = get(selectedProjectSelector);
    if (!selectedProject) return [];
    if (selectedProject?.properties && selectedProject?.properties.length > 0) {
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
  set: ({ set, get }, newPropertiesValue) => {
    // @ts-ignore
    return newPropertiesValue;
  },
});

export const droppedPropertiesSelector = selector({
  key: "droppedProperties",
  get: ({ get }) => {
    const properties = get(propertiesSelector);
    // @ts-ignore
    return properties?.filter((item) => item.lastDroppedItem);
  },
});

export const propsSlicedSelector = selector({
  key: "slicedProperties",
  get: ({ get }) => {
    const properties = get(propertiesSelector);

    if (properties === undefined) return;

    return properties?.slice(0, 3).map((item) => item?.lastDroppedItem?.key);
  },
});

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
const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Boolean to check whether properties payload is valid
export const isPropsValidSelector = selector({
  key: "isPropertiesValid",
  get: ({ get }) => {
    const properties = get(propertiesSelector);
    const propsSliced = get(propsSlicedSelector);
    const droppedSliced = get(droppedSlicedSelector);
    if (
      properties &&
      properties.length >= 3 &&
      propsSliced &&
      propsSliced.length >= 3 &&
      droppedSliced &&
      droppedSliced.length >= 3 &&
      equals(propsSliced, droppedSliced)
    ) {
      return true;
    } else {
      return false;
    }
  },
});

export const isPayloadValidSelector = selector({
  key: "isPayloadValid",
  get: ({ get }) => {},
});

// Formatted payload sent to API
export const filterPayloadSelector = selector({
  key: "firstThreeDroppedProperties",
  get: ({ get }) => {
    let properties = get(propertiesSelector);
    // @ts-ignore
    return properties.filter((item) => item.lastDroppedItem);
  },
});

// toggles reorder confirmation modal based on propped properties
export const showReorderConfirmAtom = selector({
  key: "showreorderConfirm",
  get: ({ get }) => {
    return false;
    //  if (
    //   oldDropped &&
    //   oldDroppedSliced.length === 3 &&
    //   !equals(propsSliced, oldDroppedSliced)
    // ) {
  },
  set: ({ set }, newValue) => {
    return newValue;
    //  if (
    //   oldDropped &&
    //   oldDroppedSliced.length === 3 &&
    //   !equals(propsSliced, oldDroppedSliced)
    // ) {
  },
});
