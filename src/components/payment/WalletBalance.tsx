
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Plus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WalletBalanceProps {
  onBalanceUpdate?: (balance: number) => void;
}

const WalletBalance = ({ onBalanceUpdate }: WalletBalanceProps) => {
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      // In a real app, this would fetch from a wallet table
      // For now, using localStorage as a demo
      const storedBalance = localStorage.getItem(`wallet_${user?.id}`);
      const currentBalance = storedBalance ? parseInt(storedBalance) : 0;
      setBalance(currentBalance);
      onBalanceUpdate?.(currentBalance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to top up",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(topUpAmount) * 100; // Convert to paise
      
      // In a real app, this would integrate with Razorpay
      // For demo purposes, we'll simulate the top-up
      const newBalance = balance + amount;
      localStorage.setItem(`wallet_${user?.id}`, newBalance.toString());
      setBalance(newBalance);
      setTopUpAmount('');
      onBalanceUpdate?.(newBalance);

      toast({
        title: "Wallet Topped Up!",
        description: `₹${topUpAmount} added to your wallet successfully`
      });
    } catch (error) {
      console.error('Top-up error:', error);
      toast({
        title: "Top-up Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-emerald-900 to-blue-900 border-emerald-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Wallet Balance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:bg-white/20"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-white">
          {showBalance ? `₹${(balance / 100).toFixed(2)}` : '₹****'}
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="topup" className="text-gray-300">Top-up Amount</Label>
            <Input
              id="topup"
              type="number"
              placeholder="Enter amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleTopUp}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white mt-6"
          >
            <Plus className="h-4 w-4 mr-1" />
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
