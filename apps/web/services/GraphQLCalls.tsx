
// import { updateProject } from "graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

/**
 * TAKES IN NEW PROJECT STATE AND SAVES IT TO DYNAMO DB. RETURNS NEW PROJECT STATE
 * RETURNS NULL IF ERROR
 * @param newProjectState 
 */
export const updateProjectInfo = async (newProjectState) => {
    try {
        // const result = await API.graphql(
        //     graphqlOperation(updateProject, { input: newProjectState })
        // );
        // console.log({ result });
        // return result;
    } catch (error) {
        // TODO: put error handling in toast
        console.log({ error });
        return null;
    }
}