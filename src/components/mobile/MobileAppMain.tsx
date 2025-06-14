
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Calendar, History, User } from 'lucide-react';
import MobileHome from './MobileHome';
import MobileBooking from './MobileBooking';
import MobileHistory from './MobileHistory';
import MobileProfile from './MobileProfile';

interface MobileAppMainProps {
  userLocation: { lat: number; lng: number } | null;
  userAddress: string;
}

const MobileAppMain = ({ userLocation, userAddress }: MobileAppMainProps) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="home" className="m-0 h-full">
            <MobileHome userLocation={userLocation} userAddress={userAddress} />
          </TabsContent>
          
          <TabsContent value="booking" className="m-0 h-full">
            <MobileBooking />
          </TabsContent>
          
          <TabsContent value="history" className="m-0 h-full">
            <MobileHistory />
          </TabsContent>
          
          <TabsContent value="profile" className="m-0 h-full">
            <MobileProfile />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <TabsList className="h-20 bg-white border-t border-gray-200 rounded-none grid grid-cols-4 shadow-lg">
          <TabsTrigger 
            value="home" 
            className="flex flex-col items-center justify-center h-full space-y-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="booking" 
            className="flex flex-col items-center justify-center h-full space-y-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs font-medium">Book</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="history" 
            className="flex flex-col items-center justify-center h-full space-y-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <History className="h-6 w-6" />
            <span className="text-xs font-medium">History</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="profile" 
            className="flex flex-col items-center justify-center h-full space-y-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MobileAppMain;
