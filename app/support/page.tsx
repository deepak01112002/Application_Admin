"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  MessageSquare,
  Search,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Star,
  Reply,
  MessageCircle
} from "lucide-react";

interface SupportTicket {
  _id: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responseTime?: number;
  satisfaction?: number;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');

  // Fetch support tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/support/tickets');
        // const realTickets = await response.json();

        // For now, show no data
        const realTickets: SupportTicket[] = [];

        setTickets(realTickets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const avgResponseTime = tickets.filter(t => t.responseTime).reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.filter(t => t.responseTime).length || 0;
  const avgSatisfaction = tickets.filter(t => t.satisfaction).reduce((sum, t) => sum + (t.satisfaction || 0), 0) / tickets.filter(t => t.satisfaction).length || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return <Clock className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'high': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'urgent': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'resolved': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'closed': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
  return (
      <AdminLayout currentPage="support">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Customer Support</h1>
            <p className="text-muted-foreground">Loading support tickets...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </AdminLayout>
    );
  }

      <AdminLayout currentPage="support">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customer Support</h1>
            <p className="text-muted-foreground">Manage customer support tickets and inquiries.</p>
            </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{totalTickets}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{openTickets}</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{Math.round(avgResponseTime)}h</p>
            </div>
          </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
              <p className="text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}⭐</p>
            </div>
          </div>
          </CardContent>
        </Card>
        </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by ID, customer, subject, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
            </div>
          </div>
            <div className="flex gap-2">
            <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All ({totalTickets})
              </Button>
            <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
                size="sm"
              >
                Open ({openTickets})
              </Button>
            <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
                size="sm"
              >
                In Progress ({inProgressTickets})
              </Button>
            <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('resolved')}
                size="sm"
              >
                Resolved ({resolvedTickets})
              </Button>
        </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Ticket</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Subject</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Assigned</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
            <div>
                        <div className="font-medium text-gray-900">{ticket.ticketId}</div>
                        <div className="text-sm text-gray-500">
                          Created: {formatDate(ticket.createdAt)}
            </div>
                        <div className="text-sm text-gray-500">{ticket.category}</div>
            </div>
                    </td>
                    <td className="p-4">
            <div>
                        <div className="font-medium">{ticket.customerName}</div>
                        <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
            </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-sm">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 truncate">{ticket.description}</div>
            </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getPriorityColor(ticket.priority)} flex items-center gap-1 w-fit`}>
                        {getPriorityIcon(ticket.priority)}
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {ticket.assignedTo ? (
            <div>
                            <div className="font-medium">{ticket.assignedTo}</div>
                            {ticket.responseTime && (
                              <div className="text-gray-500">{ticket.responseTime}h response</div>
                            )}
            </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
            </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
            <Button variant="outline" size="sm" title="View Ticket">
                          <Eye className="h-4 w-4" />
                        </Button>
            <Button variant="outline" size="sm" title="Reply">
                          <Reply className="h-4 w-4" />
                        </Button>
                        {ticket.satisfaction && (
                          <div className="flex items-center text-sm">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {ticket.satisfaction}
            </div>
                        )}
            </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTickets.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No tickets found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No support tickets at the moment.'}
                </p>
            </div>
            )}
          </div>
        </CardContent>
      </Card>
        </div>
    </AdminLayout>
  );
}
