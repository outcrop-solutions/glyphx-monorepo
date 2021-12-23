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
  // TODO: handle case if transitioning from n to n-1 filesOpen where n-1 !== 0
  const handleClose = async () => {
    setFilesOpen(async (prev) => {
      let newData = prev.filter((el) => el !== item);
      if (newData.length !== 0) {
        setDataGridLoading(true);
        setSelectedFile(newData[newData.length - 1]);
        const fileData = await Storage.get(`${project.id}/input/${item}`, {
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
        setDataGrid({ rows: [], columns: [] });
        setSelectedFile("");
        return newData;
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
