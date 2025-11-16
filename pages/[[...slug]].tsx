import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('../src/AppShell'), { ssr: false });

const AppPage = () => {
  return <AppShell />;
};

export default AppPage;
