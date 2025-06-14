import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CompanyStatus = 'pending' | 'approved' | 'rejected';

interface Company {
  id: string;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  status: CompanyStatus;
  services: string[];
  created_at: string;
}

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId: string, status: CompanyStatus) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status })
        .eq('id', companyId);

      if (error) throw error;

      setCompanies(companies.map(company =>
        company.id === companyId ? { ...company, status } : company
      ));

      toast({
        title: "Success",
        description: `Company ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating company status:', error);
      toast({
        title: "Error",
        description: "Failed to update company status",
        variant: "destructive"
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Management</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies by name, owner, city, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{company.company_name}</h3>
                    <p className="text-gray-600">Owner: {company.owner_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(company.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                <div>Email: {company.email}</div>
                <div>Phone: {company.phone}</div>
                <div>Location: {company.city}</div>
                <div>Registered: {new Date(company.created_at).toLocaleDateString()}</div>
              </div>

              {company.services && company.services.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Services: </span>
                  <div className="inline-flex flex-wrap gap-1">
                    {company.services.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {company.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateCompanyStatus(company.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateCompanyStatus(company.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyManagement;
