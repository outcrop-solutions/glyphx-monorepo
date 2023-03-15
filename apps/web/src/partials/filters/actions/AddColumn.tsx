export function AddColumn({ setShowCols }) {
  const handleShowCols = () => {
    setShowCols(true);
  };
  return (
    <div className="flex items-center justify-center h-6 w-6">
      <svg
        onClick={handleShowCols}
        aria-hidden="true"
        role="img"
        width="16"
        height="16"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 24 24"
      >
        <g fill="none">
          <path
            d="M12 20v-8m0 0V4m0 8h8m-8 0H4"
            stroke="#595e68"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}