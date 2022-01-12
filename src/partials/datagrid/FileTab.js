import { XIcon } from "@heroicons/react/solid";
import { Storage } from "aws-amplify";
import { parse } from "papaparse";
import { formatGridData } from "../actions/Dropzone";
export const FileTab = ({
  project,
  item,
  filesOpen,
  setFilesOpen,
  setDataGrid,
  selectedFile,
  setSelectedFile,
  setDataGridLoading,
}) => {
  // TODO: handle case where attempting to open a file that is not yet fully uploaded
  const handleClose = async () => {
    setFilesOpen(async (prev) => {
      let newData = prev.filter((el) => el !== item);
      console.log({ newData });
      if (newData.length !== 0) {
        setDataGridLoading(true);
        setSelectedFile(newData[0]);
        const fileData = await Storage.get(`${project.id}/input/${newData[0]}`, {
          download: true,
        });
        const blobData = await fileData.Body.text();
        const { data } = parse(blobData, { header: true });
        // const text = await fileDat;
        const grid = formatGridData(data);
        // console.log({ grid });
        // if file is already open, set file selected && set Grid data
        // if file is not open, get the data and set grid && add file name to files open
        setDataGridLoading(false);
        setDataGrid(grid);
        return newData;
      } else {
        setDataGridLoading(false);
        setDataGrid({ rows: [], columns: [] });
        setSelectedFile("");
        return [];
      }
    });
  };
  const handleClick = async (el) => {
    setDataGridLoading(true);
    setSelectedFile(el);
    const fileData = await Storage.get(`${project.id}/input/${el}`, {
      download: true,
    });
    const blobData = await fileData.Body.text();
    const { data } = parse(blobData, { header: true });
    // const text = await fileDat;
    const grid = formatGridData(data);
    // console.log({ grid });
    // if file is already open, set file selected && set Grid data
    // if file is not open, get the data and set grid && add file name to files open
    setDataGridLoading(false);
    setDataGrid(grid);
  };
  return (
    <div
      onClick={() => handleClick(item)}
      className={`flex relative cursor-pointer group hover:bg-gray-600 items-center ${
        selectedFile === item
          ? "border border-blue-600"
          : "border border-gray-600"
      } h-full px-4`}
    >
      <span className="text-yellow-500 mr-2 text-xs font-bold">CSV</span>
      {item}
      <div className="rounded-full bg-gray-500 hidden group-hover:flex h-4 absolute right-0 mr-2 z-60">
        <XIcon onClick={handleClose} />
      </div>
    </div>
  );
};
