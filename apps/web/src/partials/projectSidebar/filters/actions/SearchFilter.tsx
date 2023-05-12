import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import SearchIcon from 'public/svg/search-icon.svg';
import ShowIcon from 'public/svg/show-visibility.svg';
import HideIcon from 'public/svg/hide-visibility.svg';
import { isFilterWritableSelector, projectAtom } from 'state';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import { web as webTypes } from '@glyphx/types';

export const SearchFilter = ({ prop }) => {
  const setProject = useSetRecoilState(projectAtom);
  const isFilterWritable = useRecoilValue(isFilterWritableSelector);
  const [visibility, setVisibility] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);

  const addKeyword = useCallback(() => {
    setKeywords(
      produce((draft: WritableDraft<string[]>) => {
        draft.push(keyword);
      })
    );
    setKeyword('');
  }, [keyword]);

  const deleteKeyword = useCallback((idx) => {
    setKeywords(
      produce((draft: WritableDraft<string[]>) => {
        draft.splice(idx, 1);
      })
    );
  }, []);

  const handleApply = useCallback(() => {
    if (!visibility) {
      // apply local keywords to project
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.IStringFilter>).keywords =
            keywords;
        })
      );
    } else {
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.IStringFilter>).keywords =
            [];
        })
      );
    }
    setVisibility((prev) => !prev);
  }, [keywords, prop.axis, setProject, visibility]);

  return (
    <div>
      <div className="group flex items-center hover:bg-secondary-midnight py-1 px-2 gap-x-2">
        {/* SEARCH INPUT */}
        <div className="flex gap-x-2 items-center grow">
          <SearchIcon />
          <input
            type="text"
            name="keyword"
            disabled={isFilterWritable}
            id="name"
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                ev.preventDefault();
                addKeyword();
              }
            }}
            autoComplete="off"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="block grow w-[110px] h-4 rounded pl-2 font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white hover:placeholder-white focus:outline-none focus:border-primary-yellow"
            placeholder="Search Keywords"
          />
        </div>
        {/* SHOW/HIDE */}
        <div
          onClick={handleApply}
          className="rounded border border-transparent bg-secondary-space-blue hover:border-white"
        >
          {!visibility ? <ShowIcon /> : <HideIcon />}
        </div>
      </div>
      {/* SEARCH KEYWORD CHIPS */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 scrollbar-none mx-2 my-1">
          {keywords?.map((keyword, idx) => (
            <span
              key={idx}
              className={`px-1 mr-1 rounded-[2px] ${
                visibility ? 'bg-primary-yellow' : 'bg-gray'
              } h-3 hover:bg-primary-yellow-hover text-secondary-space-blue font-medium font-roboto text-[10px] flex items-center justify-between gap-x-1 align-middle cursor-pointer`}
            >
              <p>{keyword}</p>
              <svg
                onClick={() => deleteKeyword(idx)}
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.82253 0.183542C7.58589 -0.0530905 7.20364 -0.0530905 6.96701 0.183542L4 3.14448L1.03299 0.177474C0.79636 -0.0591581 0.414107 -0.0591581 0.177474 0.177474C-0.0591581 0.414107 -0.0591581 0.79636 0.177474 1.03299L3.14448 4L0.177474 6.96701C-0.0591581 7.20364 -0.0591581 7.58589 0.177474 7.82253C0.414107 8.05916 0.79636 8.05916 1.03299 7.82253L4 4.85552L6.96701 7.82253C7.20364 8.05916 7.58589 8.05916 7.82253 7.82253C8.05916 7.58589 8.05916 7.20364 7.82253 6.96701L4.85552 4L7.82253 1.03299C8.05309 0.802427 8.05309 0.414107 7.82253 0.183542Z"
                  fill="#151C2D"
                />
              </svg>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
