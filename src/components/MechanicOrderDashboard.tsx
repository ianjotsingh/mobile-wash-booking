import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Phone, User, Wrench, Calendar, Clock } from 'lucide-react';
import MechanicNotificationsPanel, { MechanicNotification } from './MechanicNotificationsPanel';

interface MechanicRequest {
  id: string;
  problem_description: string;
  car_model: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  status: string;
  user_id: string;
  assigned_mechanic_id: string | null;
  customer_phone_shared: boolean;
  mechanic_phone_shared: boolean;
  created_at: string;
}

const MechanicOrderDashboard = () => {
  const [requests, setRequests] = useState<MechanicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mechanic, setMechanic] = useState<any>(null);
  const [notifications, setNotifications] = useState<MechanicNotification[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMechanicData();
      fetchMechanicRequests();
      fetchMechanicNotifications();
    }
  }, [user]);

  const fetchMechanicData = async () => {
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setMechanic(data);
    } catch (error) {
      console.error('Error fetching mechanic data:', error);
    }
  };

  const fetchMechanicRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('mechanic_requests')
        .select('*')
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMechanicNotifications = async () => {
    if (!user) return;
    try {
      // First find this user's mechanic profile
      const { data: mechanic, error: mechanicError } = await supabase
        .from('mechanics')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (mechanicError || !mechanic) return;

      // Notifications related to mechanic requests nearby
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .eq('title', 'New Mechanic Request Nearby')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Note: To filter only for mechanics near this mechanic specifically, we'd need to store notified mechanic IDs
      // For now, this shows all un-read 'New Mechanic Request Nearby' notifications to all mechanics

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching mechanic notifications:', error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!mechanic) return;

    try {
      const { error } = await supabase
        .from('mechanic_requests')
        .update({ 
          status: 'accepted',
          assigned_mechanic_id: mechanic.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Accepted",
        description: "You have accepted this service request.",
      });

      fetchMechanicRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startService = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('mechanic_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Service Started",
        description: "Service is now in progress.",
      });

      fetchMechanicRequests();
    } catch (error) {
      console.error('Error starting service:', error);
      toast({
        title: "Error",
        description: "Failed to start service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completeService = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('mechanic_requests')
        .update({ status: 'completed' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Service Completed",
        description: "Service has been marked as completed.",
      });

      fetchMechanicRequests();
    } catch (error) {
      console.error('Error completing service:', error);
      toast({
        title: "Error",
        description: "Failed to complete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
      setNotifications((prev) => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error marking mechanic notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading requests...</div>
        </div>
      </div>
    );
  }

  // Collect some mechanic dashboard stats for display cards:
  const totalRequests = requests.length;
  const assigned = requests.filter(req => req.assigned_mechanic_id === mechanic?.id).length;
  const completed = requests.filter(req => req.status === 'completed' && req.assigned_mechanic_id === mechanic?.id).length;
  const inProgress = requests.filter(req => req.status === 'in_progress' && req.assigned_mechanic_id === mechanic?.id).length;
  const pending = requests.filter(req => req.status === 'pending').length;

  if (!mechanic) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Mechanic Profile Not Found</h2>
                <p>Please complete your mechanic registration first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const availableRequests = requests.filter(req => req.status === 'pending');
  const myRequests = requests.filter(req => req.assigned_mechanic_id === mechanic.id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* New notifications for mechanics */}
        <MechanicNotificationsPanel
          notifications={notifications}
          markRead={markNotificationAsRead}
        />

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mechanic.full_name} - Mechanic Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage incoming service requests and your assignments.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{totalRequests}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{assigned}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{inProgress}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="text-2xl font-bold">{completed}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Assigned Requests */}
        {myRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Assigned Requests</h2>
            <div className="grid gap-6">
              {myRequests.map((request) => (
                <Card key={request.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Mechanic Service Request
                      </CardTitle>
                      <Badge variant="default">
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{request.address}, {request.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{request.phone}</span>
                        </div>
                        <div className="text-sm">
                          <strong>Vehicle:</strong> {request.car_model}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <strong>Problem:</strong>
                          <p className="mt-1 text-gray-700">{request.problem_description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {request.status === 'accepted' && (
                        <Button onClick={() => startService(request.id)}>
                          Start Service
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button onClick={() => completeService(request.id)}>
                          Complete Service
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Requests */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Requests</h2>
          <div className="grid gap-6">
            {availableRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No Requests Available</h3>
                    <p className="text-gray-600">
                      There are currently no service requests in your area. Check back later!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              availableRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Mechanic Service Request
                      </CardTitle>
                      <Badge variant="secondary">
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Request #{request.id.slice(0, 8)} • {new Date(request.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{request.address}, {request.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{request.phone}</span>
                        </div>
                        <div className="text-sm">
                          <strong>Vehicle:</strong> {request.car_model}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <strong>Problem Description:</strong>
                          <p className="mt-1 text-gray-700">{request.problem_description}</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => acceptRequest(request.id)}
                      className="w-full"
                    >
                      Accept Request
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicOrderDashboard;
