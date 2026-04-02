'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiAward, FiArrowRight } from 'react-icons/fi';

import api from '@/utils/api';
import { useUser } from '@/hooks/useUser';
import Spinner from '@/components/Spinner';
import Alert from '@/components/Alert';

// Analytics components
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import ChartContainer from '@/components/analytics/ChartContainer';
import SectionHeader from '@/components/analytics/SectionHeader';

// Chart components
import RevenueChart from '@/components/RevenueChart';
import TopProductsChart from '@/components/TopProductsChart';
import SalesBreakdownChart from '@/components/SalesBreakdownChart';

// Utility function to format currency
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAdmin } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    topProducts: [],
    salesBreakdown: [],
  });
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalSalesCount: 0,
    cashPercentage: 0,
    topProduct: null,
  });

  // Access control: redirect non-admin users
  useEffect(() => {
    if (typeof window !== 'undefined' && user && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [user, isAdmin, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Only fetch if user is admin
      if (!isAdmin) return;

      try {
        setLoading(true);
        setError(null);

        const [revenueRes, topProductsRes, salesBreakdownRes] = await Promise.all([
          api.get('/dashboard/revenue'),
          api.get('/dashboard/top-products'),
          api.get('/dashboard/sales-breakdown'),
        ]);

        const revenue = revenueRes.data || [];
        const topProducts = topProductsRes.data || [];
        const salesBreakdown = salesBreakdownRes.data || [];

        setAnalyticsData({
          revenue,
          topProducts,
          salesBreakdown,
        });

        // Calculate KPI metrics
        calculateKPIs(revenue, topProducts, salesBreakdown);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  /**
   * Calculate KPI metrics from raw API data
   */
  const calculateKPIs = (revenue, topProducts, salesBreakdown) => {
    // Total Revenue: sum of all revenue values
    const totalRevenue = revenue.reduce((sum, item) => sum + (item.revenue || 0), 0);

    // Total Sales Count: sum of transaction counts from breakdown
    const totalSalesCount = salesBreakdown.reduce((sum, item) => sum + (item.count || 0), 0);

    // Cash percentage calculation
    const cashItem = salesBreakdown.find((item) => item.type === 'Cash');
    const creditItem = salesBreakdown.find((item) => item.type === 'Credit');
    const cashCount = cashItem?.count || 0;
    const creditCount = creditItem?.count || 0;
    const totalCount = cashCount + creditCount;
    const cashPercentage =
      totalCount > 0 ? Math.round((cashCount / totalCount) * 100) : 0;

    // Top product: first in sorted array
    const topProduct = topProducts.length > 0 ? topProducts[0] : null;

    setKpiData({
      totalRevenue,
      totalSalesCount,
      cashPercentage,
      topProduct,
    });
  };

  // Show spinner while loading auth state
  if (typeof window !== 'undefined' && !user) {
    return <Spinner label="Loading..." />;
  }

  // Show access denied for non-admin
  if (typeof window !== 'undefined' && user && !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <SectionHeader
          title="Analytics"
          description="Monitor your business performance, revenue trends, and product sales"
        />

        {/* Error Alert */}
        {error && <Alert variant="destructive" title="Error" message={error} className="mb-8" />}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner label="Loading analytics dashboard..." />
          </div>
        ) : (
          <>
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              <AnalyticsCard
                title="Total Revenue"
                value={formatCurrency(kpiData.totalRevenue)}
                icon={<FiDollarSign />}
                iconBg="bg-white"
                iconColor="text-indigo-600"
                subtitle="All time"
              />
              <AnalyticsCard
                title="Total Sales"
                value={kpiData.totalSalesCount.toLocaleString()}
                icon={<FiShoppingCart />}
                iconBg="bg-white"
                iconColor="text-green-600"
                subtitle={`${kpiData.cashPercentage}% cash`}
              />
              <AnalyticsCard
                title="Cash Transactions"
                value={`${kpiData.cashPercentage}%`}
                icon={<FiTrendingUp />}
                iconBg="bg-white"
                iconColor="text-emerald-600"
                subtitle="Of total sales"
              />
              <AnalyticsCard
                title="Top Product"
                value={kpiData.topProduct?.name || 'N/A'}
                icon={<FiAward />}
                iconBg="bg-white"
                iconColor="text-amber-600"
                subtitle={
                  kpiData.topProduct
                    ? `${kpiData.topProduct.totalSold} sold`
                    : 'No sales yet'
                }
              />
            </div>

            {/* Charts Section */}
            {analyticsData.revenue.length === 0 &&
            analyticsData.topProducts.length === 0 &&
            analyticsData.salesBreakdown.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiTrendingUp className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Analytics Data Yet
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Start creating sales to see revenue trends, product performance, and transaction
                  breakdowns here.
                </p>
                <button
                  onClick={() => router.push('/dashboard/sales')}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-sm"
                >
                  Create Your First Sale
                  <FiArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* Revenue Trend */}
                <SectionHeader
                  title="Revenue Performance"
                  description="Monthly revenue trends over the past 12 months"
                />
                <ChartContainer
                  title="Revenue Over Time"
                  loading={loading}
                  error={
                    analyticsData.revenue.length === 0
                      ? 'No revenue data available'
                      : null
                  }
                  className="mb-12"
                >
                  <RevenueChart data={analyticsData.revenue} />
                </ChartContainer>

                {/* Sales Insights Section */}
                <SectionHeader title="Sales Insights" description="Product performance and payment methods" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <ChartContainer
                    title="Top Products by Sales"
                    loading={loading}
                    error={
                      analyticsData.topProducts.length === 0
                        ? 'No product data available'
                        : null
                    }
                  >
                    <TopProductsChart data={analyticsData.topProducts} />
                  </ChartContainer>

                  <ChartContainer
                    title="Sales Breakdown"
                    loading={loading}
                    error={
                      analyticsData.salesBreakdown.length === 0
                        ? 'No breakdown data available'
                        : null
                    }
                  >
                    <SalesBreakdownChart data={analyticsData.salesBreakdown} />
                  </ChartContainer>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
