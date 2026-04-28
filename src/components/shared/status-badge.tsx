import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  return (
    <Badge
      variant="secondary"
      className={`${colorClass} border-0 font-medium capitalize ${className ?? ''}`}
    >
      {status.replace(/_/g, ' ').replace(/-/g, ' ')}
    </Badge>
  );
}
