import Content from '../_components/Content';
import Header from '../_components/Header';
import Sidebar from '../_components/Sidebar/index';

export default async function AccountLayout({children}) {
  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <Sidebar />
      <Content>
        <Header />
        {children}
      </Content>
    </div>
  );
}
