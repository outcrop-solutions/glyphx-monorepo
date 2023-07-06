'use client';
import { useRouter } from 'next/router';
import Item from './item';

const Menu = ({ data, isLoading, showMenu }) => {
  const router = useRouter();
  const { projectId } = router.query;
  return showMenu ? (
    <div className="space-y-2">
      {!projectId ? <h5 className="text-sm font-bold text-gray-400">{data.name}</h5> : <></>}
      <ul className={`${projectId ? 'space-y-2' : 'ml-5 leading-10'}`}>
        {data.menuItems.map((entry, index) => (
          <Item key={index} data={entry} isLoading={isLoading} isProjectView={projectId} />
        ))}
      </ul>
    </div>
  ) : null;
};

Menu.defaultProps = {
  isLoading: false,
  showMenu: false,
};

export default Menu;