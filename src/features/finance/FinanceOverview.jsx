import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { TrendingUp, TrendingDown, CreditCard, Calendar, Users } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { useFinanceStats } from "./useFinanceStats";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

function StatCard({ title, value, icon: Icon, trend, trendLabel, isLoading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                ) : null}
                <span>{Math.abs(trend).toFixed(1)}% {trendLabel}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function FinanceOverview() {
  const { data: stats, isLoading } = useFinanceStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={CreditCard}
          trend={stats?.revenueTrend}
          trendLabel="من الشهر الماضي"
          isLoading={isLoading}
        />
        <StatCard
          title="عدد المعاملات"
          value={stats?.transactionCount || 0}
          icon={Calendar}
          trend={stats?.transactionTrend}
          trendLabel="من الشهر الماضي"
          isLoading={isLoading}
        />
        <StatCard
          title="متوسط قيمة المعاملة"
          value={formatCurrency(stats?.avgTransactionValue || 0)}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          title="العملاء النشطون"
          value={stats?.activeCustomers || 0}
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>الإيرادات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : stats?.monthlyRevenueData && stats.monthlyRevenueData.length > 0 ? (
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                <AreaChart
                  data={stats.monthlyRevenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `ج.م${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'الإيرادات']}
                    labelFormatter={(label) => `شهر: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="الإيرادات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 min-h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد بيانات لإظهارها</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>أحدث المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              ))
            ) : (
              <>
                {stats?.recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                      <Badge variant="secondary">{transaction.status === 'completed' ? 'مكتمل' : transaction.status}</Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد معاملات حديثة</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}