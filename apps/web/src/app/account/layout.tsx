import {getServerSession} from 'next-auth/next';
import Content from '../_components/Content';
import Header from '../_components/Header';
import Sidebar from '../_components/Sidebar/index';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {Route} from 'next';
import {redirect} from 'next/navigation';

export default async function AccountLayout({children}) {
  const session = await getServerSession(authOptions);

  // if (!session?.user) {
  //   redirect(`/login` as Route);
  // }
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
