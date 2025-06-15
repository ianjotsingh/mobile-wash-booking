
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  ownerName: string;
  setOwnerName: (value: string) => void;
  companyType: string;
  setCompanyType: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  companyName,
  setCompanyName,
  ownerName,
  setOwnerName,
  companyType,
  setCompanyType,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="ownerName">Owner Name *</Label>
        <Input
          type="text"
          id="ownerName"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="companyType">Company Type</Label>
        <Select onValueChange={setCompanyType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
            <SelectItem value="Partnership">Partnership</SelectItem>
            <SelectItem value="Private Limited Company">Private Limited Company</SelectItem>
            <SelectItem value="Public Limited Company">Public Limited Company</SelectItem>
            <SelectItem value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email *</Label>
        <Input
          type="email"
          id="contactEmail"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="contactPhone">Contact Phone *</Label>
        <Input
          type="tel"
          id="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
