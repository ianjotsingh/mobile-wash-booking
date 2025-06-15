
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export interface MechanicNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
  order_id?: string | null;
}

interface MechanicNotificationsPanelProps {
  notifications: MechanicNotification[];
  markRead: (notificationId: string) => void;
}

const MechanicNotificationsPanel: React.FC<MechanicNotificationsPanelProps> = ({
  notifications,
  markRead,
}) => {
  if (!notifications || notifications.length === 0) return null;
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          New Mechanic Requests Nearby ({notifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="flex justify-between items-start p-3 bg-white rounded border border-blue-200"
            >
              <div>
                <h4 className="font-medium text-blue-900">{notification.title}</h4>
                <p className="text-sm text-blue-700">{notification.message}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => markRead(notification.id)}
              >
                Mark Read
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MechanicNotificationsPanel;
