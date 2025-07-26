"use client";

import { AdminLayout } from "@/components/layout/admin-layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <AdminLayout currentPage="analytics">
      <AnalyticsDashboard />
    </AdminLayout>
  );
}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time business insights and performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex gap-1">
            <Button
              variant={selectedPeriod === '7d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('7d')}
              size="sm"
            >
              7D
            </Button>
            <Button
              variant={selectedPeriod === '30d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('30d')}
              size="sm"
            >
              30D
            </Button>
            <Button
              variant={selectedPeriod === '90d' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('90d')}
              size="sm"
            >
              90D
            </Button>
            <Button
              variant={selectedPeriod === '1y' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('1y')}
              size="sm"
            >
              1Y
            </Button>
        </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.revenueGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.ordersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.ordersGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
              </div>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.customersGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.customersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.customersGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
              </div>
              <div className="flex items-center">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.conversionGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.conversionGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.conversionGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {analytics.avgOrderGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${analytics.avgOrderGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(analytics.avgOrderGrowth)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.sales} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                    <div className={`text-sm flex items-center justify-end ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(product.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.value && (
                        <p className={`text-xs font-medium ${activity.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.value > 0 ? '+' : ''}{formatCurrency(activity.value)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sales by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analytics.salesByCategory.map((category, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{category.sales}</div>
                <div className="text-sm font-medium text-gray-900">{category.category}</div>
                <div className="text-xs text-gray-500">{category.percentage}% of total sales</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
