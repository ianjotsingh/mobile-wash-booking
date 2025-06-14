
// Simple OTP service using localStorage for demo purposes
// In production, you'd want to use a more secure backend storage

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (phone: string, otp: string): void => {
  const otpData = {
    otp,
    phone,
    timestamp: Date.now(),
    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
  };
  localStorage.setItem(`otp_${phone}`, JSON.stringify(otpData));
};

export const verifyOTP = (phone: string, enteredOTP: string): boolean => {
  const storedData = localStorage.getItem(`otp_${phone}`);
  if (!storedData) return false;

  try {
    const otpData = JSON.parse(storedData);
    
    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(`otp_${phone}`);
      return false;
    }

    // Check if OTP matches
    if (otpData.otp === enteredOTP) {
      localStorage.removeItem(`otp_${phone}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};
