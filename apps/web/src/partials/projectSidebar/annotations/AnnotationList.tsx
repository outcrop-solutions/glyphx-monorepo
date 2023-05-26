import React from 'react';
import { useRecoilValue } from 'recoil';
import { Annotation } from './Annotation';
import { stateSnapshotsSelector } from 'state';
import { useAnnotations } from 'lib/client/hooks';

export const AnnotationList = () => {
  const { data, isLoading } = useAnnotations();

  return (
    data &&
    !isLoading && (
      <div className="lg:block border-b border-gray">
        <ul className="overflow-auto grow">
          {data.map((item, idx) => (
            <Annotation key={idx} item={item} idx={idx} />
          ))}
        </ul>
      </div>
    )
  );
};
