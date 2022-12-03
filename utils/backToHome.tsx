import { useSetRecoilState } from "recoil";
import {
    selectedProjectSelector,
    shareOpenAtom,
    showSearchModalAtom,
    showInfoAtom,
    showNotificationAtom,
    propertiesAtom,
    sdtValue,
} from "state";
import { useRouter } from "next/router";

/**
 * UTIL TO TAKE USER BACK TO HOME AND REFRESH PROJECT COMPONENTS
 * THIS IS JUST A TEMPLATE
 */
export function backToHome() {
    const setSelectedProject = useSetRecoilState(selectedProjectSelector);

    const setShowSearchModalOpen = useSetRecoilState(showSearchModalAtom);
    const setShare = useSetRecoilState(shareOpenAtom);
    const setShowInfo = useSetRecoilState(showInfoAtom);
    const setNotification = useSetRecoilState(showNotificationAtom);
    const setProperties = useSetRecoilState(propertiesAtom);
    const setSDTName = useSetRecoilState(sdtValue);

    const router = useRouter();
    setSelectedProject(null);
    setShare(false);
    setShowInfo(false);
    setNotification(false);
    setShowSearchModalOpen(false);
    setSDTName(null);
    setProperties([
        // TODO: THIS IS A TEMPORARY FIX, BUT NEED TO FIGURE OUT A MORE EFFICIENT WAY OF RESETING PROPERTIES
        { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    ]);
    try {
        //close glyph viewer
        //@ts-ignore
        window?.core.CloseModel();
    } catch (error) {
        // do nothng
    }
    router.push("/");
}
