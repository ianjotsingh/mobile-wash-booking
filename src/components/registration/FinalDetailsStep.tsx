
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FinalDetailsStepProps {
  companyDescription: string;
  setCompanyDescription: (value: string) => void;
  companyName: string;
  ownerName: string;
  city: string;
  state: string;
  selectedServices: string[];
  experience: string;
}

const FinalDetailsStep: React.FC<FinalDetailsStepProps> = ({
  companyDescription,
  setCompanyDescription,
  companyName,
  ownerName,
  city,
  state,
  selectedServices,
  experience
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyDescription">Company Description</Label>
        <Textarea
          id="companyDescription"
          value={companyDescription}
          onChange={(e) => setCompanyDescription(e.target.value)}
          rows={4}
          placeholder="Tell customers about your company, specializations, and what makes you unique..."
        />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Registration Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Company:</strong> {companyName}</p>
          <p><strong>Owner:</strong> {ownerName}</p>
          <p><strong>Location:</strong> {city}, {state}</p>
          <p><strong>Services:</strong> {selectedServices.length} selected</p>
          <p><strong>Experience:</strong> {experience || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

export default FinalDetailsStep;
