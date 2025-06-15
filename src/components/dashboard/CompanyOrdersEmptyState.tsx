
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CompanyOrdersEmptyState: React.FC = () => (
  <Card>
    <CardContent className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600">
          Orders assigned to your company will appear here. Make sure your company profile is complete and approved.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default CompanyOrdersEmptyState;
