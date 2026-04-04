'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { useUser } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Table from '@/components/Table';
import RevenueChart from '@/components/RevenueChart';
import TopProductsChart from '@/components/TopProductsChart';
import SalesBreakdownChart from '@/components/SalesBreakdownChart';

import {
  FiLogOut,
  FiBox,
  FiShoppingCart,
  FiAlertTriangle,
  FiCreditCard,
  FiBell,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

function DashboardCard({ title, value, iconBg, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </motion.div>
  );
}

export default function Dashboard() {

  const { user, isAdmin, isStaff } = useUser();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState({
    revenue: null,
    topProducts: null,
    salesBreakdown: null,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingNotifs, setClearingNotifs] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboard = async () => {
    console.log('Fetching dashboard stats...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await api.get('/dashboard');
      console.log('Dashboard stats fetched:', response.data);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } else {
        setError('Failed to fetch dashboard data');
      }
    }
  };

  const fetchChartData = async () => {
    if (!isAdmin) return; // Only fetch charts for admins

    console.log('Fetching chart data...');
    try {
      const [revenueRes, topProductsRes, salesBreakdownRes] = await Promise.all([
        api.get('/dashboard/revenue'),
        api.get('/dashboard/top-products'),
        api.get('/dashboard/sales-breakdown'),
      ]);
      console.log('Revenue data:', revenueRes.data);
      console.log('Top products data:', topProductsRes.data);
      console.log('Sales breakdown data:', salesBreakdownRes.data);
      setChartData({
        revenue: revenueRes.data,
        topProducts: topProductsRes.data,
        salesBreakdown: salesBreakdownRes.data,
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
      // Optionally set error for charts, but continue loading dashboard
    }
  };

  const fetchRecentSales = async () => {
    try {
      const response = await api.get('/dashboard/recent-sales?limit=10');
      setRecentSales(response.data.data || []);
    } catch (err) {
      console.error('Error fetching recent sales:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
  };

  const deleteNotification = async (id) => {
    // Optimistic update: remove from UI instantly
    const previousNotifications = notifications;
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await api.delete(`/notifications/${id}`);
      showToast('Notification deleted', 'success');
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Revert on error
      setNotifications(previousNotifications);
      showToast('Failed to delete notification', 'error');
    }
  };

  const clearAllNotifications = async () => {
    const confirmed = window.confirm('Clear all notifications? This cannot be undone.');
    if (!confirmed) return;

    const previousNotifications = notifications;
    setClearingNotifs(true);
    setNotifications([]);

    try {
      await api.delete('/notifications');
      showToast('All notifications cleared', 'success');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      // Revert on error
      setNotifications(previousNotifications);
      showToast('Failed to clear notifications', 'error');
    } finally {
      setClearingNotifs(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchDashboard(), fetchChartData(), fetchRecentSales(), fetchNotifications()]);
      setLoading(false);
    };

    fetchAll();

    const interval = setInterval(fetchAll, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      <main className="flex-1 p-8">

        <div className="max-w-7xl mx-auto">

          {/* Header */}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="flex items-center gap-2"
            >
              <FiLogOut />
              Logout
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">{error}</Alert>
          )}

          {!data ? (
            <Alert variant="destructive" className="mb-8">
              Unable to load dashboard data. Please check your backend connection.
            </Alert>
          ) : (
            <>
              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <DashboardCard
                  title="Total Products"
                  value={data.totalProducts}
                  iconBg="bg-indigo-100"
                  icon={<FiBox size={22} className="text-indigo-600" />}
                />

            <DashboardCard
              title="Sales Today"
              value={`₦${data.salesToday?.toLocaleString?.() ?? 0}`}
              iconBg="bg-green-100"
              icon={<FiShoppingCart size={22} className="text-green-600" />}
            />

            <DashboardCard
              title="Low Stock"
              value={data.lowStockItems}
              iconBg="bg-yellow-100"
              icon={<FiAlertTriangle size={22} className="text-yellow-600" />}
            />

            <DashboardCard
              title="Overdue Credits"
              value={data.overdueCredits}
              iconBg="bg-red-100"
              icon={<FiCreditCard size={22} className="text-red-600" />}
            />

          </div>

          {/* CHARTS - Only for Admins */}

          {/* {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <RevenueChart data={chartData.revenue} />
              <TopProductsChart data={chartData.topProducts} />
              <SalesBreakdownChart data={chartData.salesBreakdown} />
            </div>
          )} */}

          {/* RECENT SALES TABLE */}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {isAdmin ? 'Recent Sales' : 'Your Recent Sales'}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/sales/history')}
                className="flex items-center gap-1 text-sm py-1.5 h-8"
              >
                View More <FiChevronRight />
              </Button>
            </div>

            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {isAdmin ? 'No sales recorded yet.' : 'You have not created any sales yet.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Amount</th>
                      {isAdmin && (
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Staff</th>
                      )}
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(sale.total)}
                          <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            sale.isCredit ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {sale.isCredit ? 'Credit' : 'Cash'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {sale.user?.name || 'Unknown'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {sale.paymentMethod || 'CASH'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
            </>
          )}

          {/* NOTIFICATIONS */}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBell /> Notifications
              </h2>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={clearingNotifs}
                  className="text-sm text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                  title="Clear all notifications"
                >
                  Clear All
                </button>
              )}
            </div>

            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <FiBell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">
                    No notifications yet. You're all caught up!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-100 rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition relative group"
                    >
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete notification"
                        title="Delete notification"
                      >
                        <FiX size={16} />
                      </button>
                      <p className="text-sm text-gray-800 pr-6">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}