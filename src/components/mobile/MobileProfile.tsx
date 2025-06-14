
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MobileProfile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      
      {/* User Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.email || 'User'}
              </h2>
              <p className="text-gray-600">Customer</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">{user?.phone || 'No phone added'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Default location set</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="flex-1 text-gray-900">Settings</span>
              <span className="text-gray-400">›</span>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full justify-start h-14 border-red-200 text-red-600 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default MobileProfile;
