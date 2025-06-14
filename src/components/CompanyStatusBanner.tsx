
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface CompanyStatusBannerProps {
  status: 'pending' | 'approved' | 'rejected';
  companyName: string;
}

const CompanyStatusBanner = ({ status, companyName }: CompanyStatusBannerProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-50 border-yellow-200',
          badgeColor: 'bg-yellow-500',
          textColor: 'text-yellow-800',
          title: 'Registration Under Review',
          description: 'Your company registration is being reviewed by our team. You will receive notifications once approved.'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-50 border-green-200',
          badgeColor: 'bg-green-500',
          textColor: 'text-green-800',
          title: 'Company Approved!',
          description: 'Congratulations! Your company is now active and can receive booking requests.'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-50 border-red-200',
          badgeColor: 'bg-red-500',
          textColor: 'text-red-800',
          title: 'Registration Rejected',
          description: 'Your registration was not approved. Please contact support for more information.'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-50 border-gray-200',
          badgeColor: 'bg-gray-500',
          textColor: 'text-gray-800',
          title: 'Unknown Status',
          description: 'Please contact support for assistance.'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Card className={`${config.color} border-2`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-full ${config.badgeColor}`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className={`font-semibold ${config.textColor}`}>
                {config.title}
              </h3>
              <Badge className={config.badgeColor}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <p className={`text-sm ${config.textColor} mb-2`}>
              Company: {companyName}
            </p>
            <p className={`text-sm ${config.textColor}`}>
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyStatusBanner;
