import { Outlet } from 'react-router';

import AppLayout from './AppLayout';

function AppRouteLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default AppRouteLayout;
