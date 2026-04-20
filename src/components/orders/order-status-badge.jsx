import { Badge } from "@/components/ui/badge";

const MAP = {
  placed: { variant: "warning", label: "Awaiting payment" },
  confirmed: { variant: "accent", label: "Confirmed" },
  packed: { variant: "accent", label: "Packed" },
  shipped: { variant: "accent", label: "Shipped" },
  delivered: { variant: "success", label: "Delivered" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  refunded: { variant: "secondary", label: "Refunded" },
};

export function OrderStatusBadge({ status, className }) {
  const cfg = MAP[status] || { variant: "secondary", label: status };
  return (
    <Badge variant={cfg.variant} className={className}>
      {cfg.label}
    </Badge>
  );
}
