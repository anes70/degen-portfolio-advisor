export const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  if (price < 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 6,
    }).format(price);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

export const formatPercentage = (num: number): string => {
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

export const truncateAddress = (address: string): string => {
  if (!address) return '';
  if (address.startsWith('0x')) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
};
