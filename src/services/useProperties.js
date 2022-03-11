import { useState, useEffect } from "react";
import { Storage } from "aws-amplify";

export const useProperties = (project) => {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    const getProperties = async () => {
      try {
        let sidebarData = await Storage.get("sidebar.json", {
          download: true,
        });
        // data.Body is a Blob
        sidebarData.Body.text().then((string) => {
          let { properties } = JSON.parse(string);
          setProperties({ ...properties });
        });
      } catch (error) {
        console.log({ error });
      }
    };
    getProperties();
  }, [project]);

  return { properties };
};
