import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PublicDashboard } from './pages/PublicDashboard';
import { TransactionDetail } from './pages/TransactionDetail';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTransactions } from './pages/admin/AdminTransactions';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <PublicDashboard />,
      },
      {
        path: '/transactions/:id',
        element: <TransactionDetail />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: <AdminDashboard />,
      },
      {
        path: '/admin/transactions',
        element: <AdminTransactions />,
      },
    ],
  },
]);
