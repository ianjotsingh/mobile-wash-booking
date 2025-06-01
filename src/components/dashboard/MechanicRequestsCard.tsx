
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Phone, MapPin, Clock, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MechanicRequest {
  id: string;
  problem_description: string;
  car_model: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  status: string;
  created_at: string;
}

interface MechanicRequestsCardProps {
  requests: MechanicRequest[];
  onRequestUpdate: () => void;
}

const MechanicRequestsCard = ({ requests, onRequestUpdate }: MechanicRequestsCardProps) => {
  const { toast } = useToast();

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('mechanic_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request accepted",
        description: "You can now contact the customer",
      });

      onRequestUpdate();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="h-5 w-5" />
          <span>Mechanic Requests</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mechanic Requests</h3>
            <p className="text-gray-600">Mechanic requests will appear here when customers need assistance.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">Mechanic Request</h4>
                    <p className="text-sm text-gray-600">Request #{request.id.slice(0, 8)}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong>Problem:</strong> {request.problem_description}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="h-4 w-4" />
                    {request.car_model}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {request.address}, {request.city} - {request.zip_code}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {request.phone}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <Button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Accept Request
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MechanicRequestsCard;
