import { useRecoilValue } from "recoil";
import {
    droppedPropertiesSelector,
    selectedProjectSelector,
    userIdSelector,
    AxisInterpolationAtom,
    AxisDirectionAtom
} from "../state";


/**
 * CALLS 1ST HALF OF ETL AFTER FILE UPLOAD AND RETURNS RESPONSE
 * @param ID : Project ID
 * @returns 
 */
export const postUploadCall = async (ID) => {

    const result = await fetch(
        "https://hs02lfxf71.execute-api.us-east-2.amazonaws.com/default/etl-process-new-file-GLUE_API",
        {
            method: "post",
            // mode: 'no-cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model_id: `${ID}`,
                bucket_name: "sampleproject04827-staging",
            }),
        }
    );
    const serverData = await result.json();
    return serverData;
}


/**
 * CREATE'S MODEL USING 2ND HALF OF ETL PIPELINE AND RETURNS RESPONSE
 */
export const createModelCall = async () => {
    const selectedProject = useRecoilValue(selectedProjectSelector);
    const userId = useRecoilValue(userIdSelector);
    const interpolation = useRecoilValue(AxisInterpolationAtom);
    const direction = useRecoilValue(AxisDirectionAtom);
    const droppedProps = useRecoilValue(droppedPropertiesSelector);
    let response = await fetch("https://adj71mzk16.execute-api.us-east-2.amazonaws.com/default/sgx-api-build-model", {
        method: "POST",
        // mode: "no-cors",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model_id: selectedProject.id, // Model Name
            x_axis: droppedProps[0].lastDroppedItem.key, // X-axis name
            y_axis: droppedProps[1].lastDroppedItem.key, // Y-axis name
            z_axis: droppedProps[2].lastDroppedItem.key, // Z-axis name
            user_id: userId, // AWS Cognito UserID
            x_func: interpolation.X, // X-axis Interpolation
            y_func: interpolation.Y, // y-axis Interpolation
            z_func: interpolation.Z, // Z-axis Interpolation
            x_direction: direction.X, // X-axis Direction
            y_direction: direction.Y, // y-axis Direction
            z_direction: direction.Z // Z-axis Direction
        }),
    });
    const serverData = await response.json();
    return serverData;
    
}