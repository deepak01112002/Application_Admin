"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail, Phone } from "lucide-react";
import { useState } from "react";

const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    orders: 12,
    totalSpent: "$1,250.00",
    status: "active",
    joinDate: "2023-05-15",
    lastOrder: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    orders: 8,
    totalSpent: "$890.00",
    status: "active",
    joinDate: "2023-08-22",
    lastOrder: "2024-01-12",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1 (555) 456-7890",
    orders: 3,
    totalSpent: "$320.00",
    status: "inactive",
    joinDate: "2023-11-10",
    lastOrder: "2023-12-05",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1 (555) 321-0987",
    orders: 15,
    totalSpent: "$2,100.00",
    status: "active",
    joinDate: "2023-03-08",
    lastOrder: "2024-01-10",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "inactive":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export function CustomerTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Customers</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-10 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Contact</th>
                <th className="text-left p-2">Orders</th>
                <th className="text-left p-2">Total Spent</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Last Order</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="p-2">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined: {customer.joinDate}
                      </p>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 font-medium">{customer.orders}</td>
                  <td className="p-2 font-medium">{customer.totalSpent}</td>
                  <td className="p-2">
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="p-2">{customer.lastOrder}</td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}