
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Phone, MapPin, Clock, Car, Users } from 'lucide-react';
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
  assigned_mechanic_id?: string;
  customer_phone_shared?: boolean;
  mechanic_phone_shared?: boolean;
}

interface Mechanic {
  id: string;
  full_name: string;
  phone: string;
  specializations: string[];
}

interface MechanicRequestsCardProps {
  requests: MechanicRequest[];
  onRequestUpdate: () => void;
}

const MechanicRequestsCard = ({ requests, onRequestUpdate }: MechanicRequestsCardProps) => {
  const { toast } = useToast();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);

  const fetchApprovedMechanics = async () => {
    if (loadingMechanics) return;
    
    setLoadingMechanics(true);
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .select('id, full_name, phone, specializations')
        .eq('status', 'approved');

      if (error) throw error;
      setMechanics(data || []);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoadingMechanics(false);
    }
  };

  const handleAssignMechanic = async (requestId: string, mechanicId: string) => {
    try {
      console.log('Assigning mechanic:', mechanicId, 'to request:', requestId);

      const { error } = await supabase
        .from('mechanic_requests')
        .update({ 
          assigned_mechanic_id: mechanicId,
          status: 'assigned'
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error assigning mechanic:', error);
        throw error;
      }

      toast({
        title: "Mechanic assigned",
        description: "The mechanic has been assigned to this request",
      });

      onRequestUpdate();
    } catch (error) {
      console.error('Error assigning mechanic:', error);
      toast({
        title: "Error",
        description: "Failed to assign mechanic",
        variant: "destructive",
      });
    }
  };

  const handleShareContact = async (requestId: string, shareType: 'customer' | 'mechanic') => {
    try {
      const updateField = shareType === 'customer' ? 'customer_phone_shared' : 'mechanic_phone_shared';
      
      const { error } = await supabase
        .from('mechanic_requests')
        .update({ [updateField]: true })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Contact shared",
        description: `${shareType === 'customer' ? 'Customer' : 'Mechanic'} contact has been shared`,
      });

      onRequestUpdate();
    } catch (error) {
      console.error('Error sharing contact:', error);
      toast({
        title: "Error",
        description: "Failed to share contact",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  React.useEffect(() => {
    fetchApprovedMechanics();
  }, []);

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
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Assign Mechanic:</span>
                    </div>
                    <Select onValueChange={(mechanicId) => handleAssignMechanic(request.id, mechanicId)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a mechanic" />
                      </SelectTrigger>
                      <SelectContent>
                        {mechanics.map((mechanic) => (
                          <SelectItem key={mechanic.id} value={mechanic.id}>
                            {mechanic.full_name} - {mechanic.specializations.slice(0, 2).join(', ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {request.status === 'assigned' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {!request.customer_phone_shared && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareContact(request.id, 'customer')}
                        >
                          Share Customer Contact
                        </Button>
                      )}
                      {!request.mechanic_phone_shared && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareContact(request.id, 'mechanic')}
                        >
                          Share Mechanic Contact
                        </Button>
                      )}
                    </div>
                    {request.customer_phone_shared && request.mechanic_phone_shared && (
                      <p className="text-sm text-green-600">Both contacts have been shared</p>
                    )}
                  </div>
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
