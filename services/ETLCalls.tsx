
/**
 * CALLS 1ST HALF OF ETL AFTER FILE UPLOAD AND RETURNS RESPONSE
 * @param ID : Project ID
 * @returns 
 */
export const postUploadCall = async (ID) => {

    console.log("ID IN POST UPLOAD CALL",{ID})

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
 * @param modelID 
 * @param axis 
 * @param userId 
 * @param interpolation 
 * @param direction 
 * @returns 
 */
export const createModelCall = async (modelID,axis,userId,interpolation,direction) => {
    
    let response = await fetch("https://adj71mzk16.execute-api.us-east-2.amazonaws.com/default/sgx-api-build-model", {
        method: "POST",
        // mode: "no-cors",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model_id: modelID, // Model Name
            x_axis: axis.X, // X-axis name
            y_axis: axis.Y, // Y-axis name
            z_axis: axis.Z, // Z-axis name
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