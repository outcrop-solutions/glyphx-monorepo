import { useState } from "react";

function EditFilter(props) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");

  const handleName = (e) => {
    setName(e.target.value);
  };
  const handleSaveName = () => {};

  return (
    <div>
      <div className="flex items-center justify-center h-6 w-6">
        {edit ? (
          <svg
            onClick={() => setEdit(false)}
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 16 16"
          >
            <g fill="#595e68">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.5 1h13l.5.5v13l-.5.5h-13l-.5-.5v-13l.5-.5zM2 2v12h12V2H2zm6 9a3 3 0 1 0 0-6a3 3 0 0 0 0 6z"
              />
            </g>
          </svg>
        ) : (
          <svg
            onClick={() => setEdit(true)}
            aria-hidden="true"
            role="img"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <g fill="none">
              <path
                d="M4.42 20.579a1 1 0 0 1-.737-.326a.988.988 0 0 1-.263-.764l.245-2.694L14.983 5.481l3.537 3.536L7.205 20.33l-2.694.245a.95.95 0 0 1-.091.004zM19.226 8.31L15.69 4.774l2.121-2.121a1 1 0 0 1 1.415 0l2.121 2.121a1 1 0 0 1 0 1.415l-2.12 2.12l-.001.001z"
                fill="#595e68"
              />
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}

export default EditFilter;
