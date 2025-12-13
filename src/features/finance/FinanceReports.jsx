import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Download, TrendingUp, TrendingDown, Calendar, CreditCard } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { useFinanceReportData } from "./useFinanceReportData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinanceReports() {
  const [reportType, setReportType] = useState("revenue");
  const [period, setPeriod] = useState("month");
  const { data: reportData, isLoading } = useFinanceReportData(reportType);

  const handleExport = () => {
    // In a real implementation, this would export the report to PDF or Excel
    alert(`تصدير ${getCurrentReportTitle()} إلى ملف`);
  };

  const getCurrentReportTitle = () => {
    switch (reportType) {
      case "revenue": return "تقرير الإيرادات";
      case "patients": return "تقرير المرضى";
      case "services": return "تقرير الخدمات";
      default: return "تقرير مالي";
    }
  };

  const getCurrentReportDescription = () => {
    switch (reportType) {
      case "revenue": return "تحليل الإيرادات حسب الفترة الزمنية";
      case "patients": return "تحليل عدد المرضى وقيمة المعاملات";
      case "services": return "تحليل الإيرادات حسب نوع الخدمة";
      default: return "تقرير مالي شامل";
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-80 min-h-[320px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!reportData || reportData.length === 0) {
      return (
        <div className="h-80 min-h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد بيانات لإظهارها</p>
          </div>
        </div>
      );
    }

    switch (reportType) {
      case "revenue":
        return (
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <BarChart
                data={reportData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} />
                <YAxis tickFormatter={(value) => `ج.م${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'الإيرادات']}
                  labelFormatter={(label) => `الفترة: ${label}`}
                />
                <Legend />
                <Bar dataKey="value" name="الإيرادات" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "patients":
        return (
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <LineChart
                data={reportData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `ج.م${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'patients') return [value, 'عدد المرضى'];
                    return [formatCurrency(value), 'الإيرادات'];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="patients" 
                  name="عدد المرضى" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  name="الإيرادات" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case "services":
        return (
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <PieChart>
                <Pie
                  data={reportData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ service, percentage }) => `${service}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="service"
                >
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'الإيرادات']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return (
          <div className="h-80 min-h-[320px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">نوع التقرير غير مدعوم</p>
            </div>
          </div>
        );
    }
  };

  const renderSummaryCards = () => {
    if (isLoading || !reportData || reportData.length === 0) return null;

    let totalValue, avgValue, growth;
    
    switch (reportType) {
      case "revenue":
        totalValue = reportData.reduce((sum, item) => sum + item.value, 0);
        avgValue = reportData.length > 0 ? totalValue / reportData.length : 0;
        growth = reportData.length > 1 ? 
          ((reportData[reportData.length - 1].value - reportData[reportData.length - 2].value) / 
          reportData[reportData.length - 2].value) * 100 : 0;
        break;
      
      case "patients":
        totalValue = reportData.reduce((sum, item) => sum + item.patients, 0);
        avgValue = reportData.length > 0 ? totalValue / reportData.length : 0;
        growth = reportData.length > 1 ? 
          ((reportData[reportData.length - 1].patients - reportData[reportData.length - 2].patients) / 
          reportData[reportData.length - 2].patients) * 100 : 0;
        break;
      
      case "services":
        totalValue = reportData.reduce((sum, item) => sum + item.revenue, 0);
        avgValue = reportData.length > 0 ? totalValue / reportData.length : 0;
        growth = 0; // Not applicable for services
        break;
      
      default:
        totalValue = 0;
        avgValue = 0;
        growth = 0;
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {reportType === 'revenue' ? 'إجمالي الإيرادات' : 
               reportType === 'patients' ? 'إجمالي المرضى' : 'إجمالي الإيرادات'}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportType === 'revenue' || reportType === 'services' ? formatCurrency(totalValue) : 
               `${totalValue} مريض`}
            </div>
            <p className="text-xs text-muted-foreground">في الفترة المحددة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتوسط</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportType === 'revenue' || reportType === 'services' ? formatCurrency(avgValue) : 
               `${Math.round(avgValue)} مريض`}
            </div>
            <p className="text-xs text-muted-foreground">لكل فترة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النمو</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">مقارنة بالفترة السابقة</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReportData = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!reportData || reportData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد بيانات للتقرير</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reportData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{item.period || item.service}</div>
              {item.patients !== undefined && (
                <div className="text-sm text-muted-foreground">
                  {item.patients} مريض - {formatCurrency(item.revenue)}
                </div>
              )}
            </div>
            <div className="text-right">
              {item.value !== undefined && (
                <>
                  <div className="font-medium">{formatCurrency(item.value)}</div>
                  {item.change !== undefined && (
                    <div className={`text-sm flex items-center justify-end ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(item.change).toFixed(1)}%
                    </div>
                  )}
                </>
              )}
              {item.revenue !== undefined && item.patients !== undefined && (
                <div className="font-medium">{formatCurrency(item.revenue)}</div>
              )}
              {item.percentage && (
                <Badge variant="secondary">{item.percentage}%</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            إعدادات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">تقرير الإيرادات</SelectItem>
                <SelectItem value="patients">تقرير المرضى</SelectItem>
                <SelectItem value="services">تقرير الخدمات</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">هذاQuarter</SelectItem>
                <SelectItem value="year">هذه السنة</SelectItem>
                <SelectItem value="custom">فترة مخصصة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {renderSummaryCards()}

      {/* Report Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {getCurrentReportTitle()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getCurrentReportDescription()}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderReportData()}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>الرسم البياني</CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}