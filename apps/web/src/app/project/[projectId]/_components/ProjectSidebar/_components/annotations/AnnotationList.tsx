'use client';
import React from 'react';
import {Annotation} from './Annotation';
import {InputArea} from './tiptap/InputArea';
import {useAnnotations} from 'lib/client/hooks';

export const AnnotationList = () => {
  const {data, type, id, revalidate} = useAnnotations();
  return (
    <div className="lg:block border-b border-gray h-full">
      {data && (
        <ul className="overflow-auto grow">
          {data.map((item, idx) => (
            <Annotation key={idx} item={item} />
          ))}
        </ul>
      )}
      <InputArea id={id} type={type} revalidate={revalidate} />
    </div>
  );
};
