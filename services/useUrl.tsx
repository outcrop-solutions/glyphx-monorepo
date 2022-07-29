import { useEffect } from "react";
import { Storage } from "aws-amplify";

/**
 * Utility for passing a new SignedURL (corresponding to ETL output in S3) to Qt
 * @param {Object} project
 * @returns {Object}
 * states - {Array}
 * setStates - {function}
 * state - {Array}
 * setState - {function}
 * deleteState - {function}
 */

// TODO: use hook calls for passing url
export const useUrl = (project) => {
  //pass presigned url
  useEffect(() => {
    const signUrl = async () => {
      try {
        let signedUrl = await Storage.get("mcgee_sku_model.zip");
        if (project && window.core) {
          window.core.OpenProject(JSON.stringify(signedUrl));
        }
      } catch (error) {
        console.log({ error });
      }
    };
    signUrl();
  }, [project]);

  return { isUrlSigned: true };
};
