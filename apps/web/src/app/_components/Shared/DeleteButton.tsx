import React from 'react';

export function DeleteButton({selectedItems}) {
  return (
    <div className={`${selectedItems.length < 1 && 'hidden'}`}>
      <div className="flex items-center">
        <div className="hidden xl:block text-sm italic mr-2 whitespace-nowrap">
          <span>{selectedItems.length}</span> items selected
        </div>
        <button className="btn border-gray hover:border-slate-300 text-rose-500 hover:text-rose-600">Delete</button>
      </div>
    </div>
  );
}
