import React from 'react';
import { Annotation } from './Annotation';
import { InputArea } from './InputArea';
import { useAnnotations } from 'lib/client/hooks';

export const AnnotationList = () => {
  const { data, type, id } = useAnnotations();
  return (
    <div className="lg:block border-b border-gray">
      <ul className="overflow-auto grow">{data && data.map((item, idx) => <Annotation key={idx} item={item} />)}</ul>
      <InputArea id={id} type={type} />
    </div>
  );
};
