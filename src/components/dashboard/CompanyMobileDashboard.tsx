
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Order {
  id: string;
  service_type: string;
  address: string;
  customer_name: string;
  phone: string;
  status: string;
  amount: number;
  time: string;
  distance: string;
}

const CompanyMobileDashboard = () => {
  const [activeTab, setActiveTab] = useState('live');

  const mockOrders: Order[] = [
    {
      id: '1',
      service_type: 'Premium Wash',
      address: '123 Business Park, BKC, Mumbai',
      customer_name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      status: 'new',
      amount: 500,
      time: '2:30 PM',
      distance: '2.5 km'
    },
    {
      id: '2',
      service_type: 'Basic Wash',
      address: '456 Residential Complex, Powai',
      customer_name: 'Priya Sharma',
      phone: '+91 87654 32109',
      status: 'in_progress',
      amount: 300,
      time: '3:00 PM',
      distance: '1.2 km'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'accepted': return 'bg-yellow-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'New Request';
      case 'accepted': return 'Accepted';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold">Company Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage your orders and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">₹2,450</p>
                <p className="text-xs text-gray-400">Today's Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-xs text-gray-400">Orders Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="live" className="text-xs">Live Orders</TabsTrigger>
          <TabsTrigger value="new" className="text-xs">New Requests</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
          <TabsTrigger value="earnings" className="text-xs">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <Card key={order.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white">{order.service_type}</h3>
                        <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">₹{order.amount}</p>
                      <p className="text-xs text-gray-400">{order.time}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{order.phone}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'new' && (
                      <>
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-red-600 text-red-400">
                          Decline
                        </Button>
                      </>
                    )}
                    {order.status === 'in_progress' && (
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No new requests at the moment</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="space-y-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white">Premium Wash</h3>
                    <p className="text-gray-400 text-sm">Completed at 1:30 PM</p>
                  </div>
                  <p className="text-green-400 font-bold">₹500</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Today</span>
                    <span className="text-white font-semibold">₹2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Week</span>
                    <span className="text-white font-semibold">₹12,800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-white font-semibold">₹45,600</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMobileDashboard;
