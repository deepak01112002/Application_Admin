"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const recentOrders = [
  {
    id: "#3210",
    customer: "John Doe",
    status: "pending",
    amount: "$250.00",
    date: "2024-01-15",
  },
  {
    id: "#3211",
    customer: "Jane Smith",
    status: "shipped",
    amount: "$450.00",
    date: "2024-01-15",
  },
  {
    id: "#3212",
    customer: "Bob Johnson",
    status: "delivered",
    amount: "$180.00",
    date: "2024-01-14",
  },
  {
    id: "#3213",
    customer: "Alice Brown",
    status: "cancelled",
    amount: "$320.00",
    date: "2024-01-14",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}