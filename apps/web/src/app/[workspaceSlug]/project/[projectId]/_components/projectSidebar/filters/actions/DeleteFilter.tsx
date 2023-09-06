export function DeleteFilter({handleDeleteFilter}) {
  return (
    <div className="flex items-center justify-center h-6 w-6">
      <svg
        onClick={handleDeleteFilter}
        aria-hidden="true"
        role="img"
        width="16"
        height="16"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 24 24"
      >
        <g fill="none" stroke="#595e68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </g>
      </svg>
    </div>
  );
}
