import React from 'react';
import { useRouter } from 'next/router';
import { SearchModal, GridToggle, DropdownNotifications, Help } from 'partials';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  orientationAtom,
  selectedProjectSelector,
  shareOpenAtom,
  showAddProjectAtom,
  showSearchModalAtom,
  showInfoAtom,
  payloadSelector,
  propertiesAtom,
  sdtValue,
} from 'src/state';

export const Header = () => {
  const [selectedProject, setSelectedProject] = useRecoilState(selectedProjectSelector);
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);
  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
  const setShare = useSetRecoilState(shareOpenAtom);
  const setShowInfo = useSetRecoilState(showInfoAtom);
  const [paneOrientation, setOrientation] = useRecoilState(orientationAtom);
  const payload = useRecoilValue(payloadSelector);
  const setProperties = useSetRecoilState(propertiesAtom);
  const [sdtName, setSDTName] = useRecoilState(sdtValue);

  const router = useRouter();

  const backPresssed = () => {
    setSelectedProject(null);
    setShare(false);
    setShowInfo(false);
    setShowSearchModalOpen(false);
    setSDTName(null);
    setProperties([
      // TODO: THIS IS A TEMPORARY FIX, BUT NEED TO FIGURE OUT A MORE EFFICIENT WAY OF RESETING PROPERTIES
      { axis: 'X', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
      { axis: 'Y', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
      { axis: 'Z', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
      { axis: '1', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
      { axis: '2', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
      { axis: '3', accepts: 'COLUMN_DRAG', lastDroppedItem: null },
    ]);
    try {
      //close glyph viewer
      window?.core.CloseModel();
    } catch (error) {
      // do nothng
    }
    router.push('/');
  };

  const handleChange = (e) => {
    setSelectedProject((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePaneSwitch = () => {
    if (paneOrientation === 'horizontal') {
      setOrientation('vertical');
    } else {
      setOrientation('horizontal');
    }
  };

  return (
    // border-b border-gray
    <div className="sticky flex justify-between items-center bg-secondary-midnight  h-14 w-full pt-2 pb-2 px-4">
      <div className="flex items-center group border border-transparent pr-2 ml-6 bg-transparent">
        <div className="text-left">
          <p className="font-rubik font-normal text-white text-[22px] leading-[26px] tracking-[0.01em]">My Projects</p>
        </div>
      </div>
      {/* TODO: FIX SEARCH MODAL ISSUE AND UNCOMMENT IT */}
      {/* <SearchModal /> */}
      <div className="flex flex-row space-x-3 pr-2">
        <button
          className="h-8 px-2 flex items-center justify-center bg-primary-yellow hover:bg-primary-yellow-hover rounded-[2px] ml-3"
          onClick={(e) => {
            setShowAddProject(true);
          }}
          aria-controls="search-modal"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className=" h-4 w-4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.1429 6.85714H6.85714V11.1429C6.85714 11.6143 6.47143 12 6 12C5.52857 12 5.14286 11.6143 5.14286 11.1429V6.85714H0.857143C0.385714 6.85714 0 6.47143 0 6C0 5.52857 0.385714 5.14286 0.857143 5.14286H5.14286V0.857143C5.14286 0.385714 5.52857 0 6 0C6.47143 0 6.85714 0.385714 6.85714 0.857143V5.14286H11.1429C11.6143 5.14286 12 5.52857 12 6C12 6.47143 11.6143 6.85714 11.1429 6.85714Z"
              fill="#000"
            />
          </svg>

          <p className="font-roboto font-medium text-[14px] leading-[16px] text-secondary-space-blue mx-2">New Model</p>
        </button>

        <GridToggle />
        <DropdownNotifications align="right" />
      </div>
    </div>
  );
};
