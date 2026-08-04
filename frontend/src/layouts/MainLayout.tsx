import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import DevTools from '../components/DevTools';

export default function MainLayout() {
  return (
    <>
      <Outlet />
      <DevTools />
      <BottomNavBar />
    </>
  );
}
