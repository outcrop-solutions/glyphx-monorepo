import React from 'react';
import { Annotation } from './Annotation';

export const AnnotationList = ({ data }) => {
  return (
    <div className="lg:block border-b border-gray">
      <ul className="overflow-auto grow">
        {data.map((item, idx) => (
          <Annotation key={idx} item={item} />
        ))}
      </ul>
    </div>
  );
};
