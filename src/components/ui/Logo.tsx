interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-11',
    md: 'h-14',
    lg: 'h-16'
  };

  return (
    <img
      src="/logo.jpg"
      alt="TropicalRealtors"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
}