import { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listFilters } from "../graphql/queries";

/**
 * returns all filters from the Filters class
 * @returns {Object}
 */

export const useFilters = () => {
  const [filters, setFilters] = useState([]);
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filterData = await API.graphql(graphqlOperation(listFilters));
        const filterList = filterData.data.listFilters.items;

        setFilters((prev) => {
          let newData = [...filterList];
          return newData;
        });
      } catch (error) {
        console.log("error on fetching filters", error);
      }
    };
    fetchFilters();
  }, []);
  return { filters };
};
