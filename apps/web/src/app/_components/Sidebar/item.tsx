'use client';
import {Route} from 'next';
import Link from 'next/link';
import { ReactElement } from 'react';

const Item = ({data = null, isLoading = false, isProjectView}: {data: {path: Route, name: string, altIcon: ReactElement} | null, isLoading: boolean, isProjectView: boolean}) => {
  return isLoading ? (
    <div className="h-6 mb-3 bg-gray-600 rounded animate-pulse" />
  ) : (
    <li>
      <Link href={data?.path as string as Route}>
        {!isProjectView ? (
          <span className="text-gray-300 hover:text-white">{data?.name}</span>
        ) : (
          <div className="h-8 w-8">{data?.altIcon}</div>
        )}
      </Link>
    </li>
  );
};

export default Item;
