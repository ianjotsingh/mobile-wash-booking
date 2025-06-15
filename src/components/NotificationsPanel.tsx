
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id?: string;
}

interface NotificationsPanelProps {
  unreadNotifications: NotificationData[];
  markNotificationAsRead: (notificationId: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ unreadNotifications, markNotificationAsRead }) => {
  if (unreadNotifications.length === 0) return null;
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          New Notifications ({unreadNotifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unreadNotifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex justify-between items-start p-3 bg-white rounded border border-blue-200">
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
                onClick={() => markNotificationAsRead(notification.id)}
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

export default NotificationsPanel;
