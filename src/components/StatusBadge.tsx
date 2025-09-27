import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  new: { 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-400', 
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20'
  },
  active: { 
    bg: 'bg-yellow-500/20', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/20'
  },
  qualified: { 
    bg: 'bg-green-500/20', 
    text: 'text-green-400', 
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20'
  },
  converted: { 
    bg: 'bg-purple-500/20', 
    text: 'text-purple-400', 
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20'
  },
  paused: { 
    bg: 'bg-gray-500/20', 
    text: 'text-gray-400', 
    border: 'border-gray-500/30',
    glow: 'shadow-gray-500/20'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border backdrop-blur-sm font-medium capitalize
      ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
      shadow-lg ${config.glow}
    `}>
      <div className={`w-2 h-2 rounded-full ${config.text.replace('text-', 'bg-')} mr-2 animate-pulse`} />
      {status}
    </span>
  );
};

export default StatusBadge;