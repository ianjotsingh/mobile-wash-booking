
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface LocationStepProps {
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  hasMechanic: boolean;
  setHasMechanic: (value: boolean) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  zipCode,
  setZipCode,
  experience,
  setExperience,
  hasMechanic,
  setHasMechanic
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Full Address *</Label>
        <Input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address, building number"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="experience">Years of Experience</Label>
        <Select onValueChange={setExperience}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-1">0-1 years</SelectItem>
            <SelectItem value="1-3">1-3 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="5-10">5-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasMechanic"
          checked={hasMechanic}
          onCheckedChange={(checked) => setHasMechanic(checked === true)}
        />
        <Label htmlFor="hasMechanic">We provide mechanic services</Label>
      </div>
    </div>
  );
};

export default LocationStep;
