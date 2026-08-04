import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';

export default function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomNavBar />
    </>
  );
}
