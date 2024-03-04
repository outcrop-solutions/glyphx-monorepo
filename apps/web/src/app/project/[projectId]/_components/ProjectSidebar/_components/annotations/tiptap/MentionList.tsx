'use client';
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
// eslint-disable-next-line react/display-name
const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({id: item.name ?? item.email});
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({event}) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-secondary-deep-blue text-xs overflow-hidden p-1 relative flex flex-col space-y-2">
      {/* @ts-ignore */}
      {props.items.length ? (
        // @ts-ignore
        props.items.map((item, index) => (
          <div className="px-2">
            <button
              className={`bg-transparent border-gray rounded text-xs text-white  ${index === selectedIndex ? 'opacity-95' : ''}`}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.name ?? item.email}
            </button>
          </div>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});

export default MentionList;
