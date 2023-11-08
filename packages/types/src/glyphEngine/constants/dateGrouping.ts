export enum DATE_GROUPING {
  DAY_OF_YEAR = 'day_of_year',
  DAY_OF_MONTH = 'day_of_month',
  DAY_OF_WEEK = 'day_of_week',
  WEEK_OF_YEAR = 'week_of_year',
  YEAR_OF_WEEK = 'year_of_week',
  YEAR = 'year',
  MONTH = 'month',
  QUARTER = 'quarter',
}

// "
//    WITH temp as (
//        SELECT
//        "col1" as xColumn,  // Alias for the result of the expression
//        "col2" as yColumn,  // Alias for the result of the expression
//        SUM(zColumn) as zColumn
//      FROM "glyphx_testclientid9755e7e3e9234096b2914db005669b15_654bc147b15403b4bb59ac60_view"

//      GROUP BY "col1", "col2"  // Grouping by the expressions directly
//    )
//    SELECT
//      MIN(xColumn) as "mincol1",  // Referencing the aliases given in the CTE
//      MAX(xColumn) as "maxcol1",
//      MIN(yColumn) as "mincol2",
//      MAX(yColumn) as "maxcol2",
//      MIN(zColumn) as "mincol4",  // Assuming zCol is a valid aggregation
//      MAX(zColumn) as "maxcol4"
//    FROM temp;
//  ";
