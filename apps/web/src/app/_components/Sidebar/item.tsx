'use client';
import {Route} from 'next';
import Link from 'next/link';

const Item = ({data, isLoading, isProjectView}) => {
  return isLoading ? (
    <div className="h-6 mb-3 bg-gray-600 rounded animate-pulse" />
  ) : (
    <li>
      <Link href={data.path as Route} legacyBehavior>
        {!isProjectView ? (
          <a className="text-gray-300 hover:text-white">{data.name}</a>
        ) : (
          <div className="h-8 w-8">{data.altIcon}</div>
        )}
      </Link>
    </li>
  );
};

Item.defaultProps = {
  data: null,
  isLoading: false,
};

export default Item;
