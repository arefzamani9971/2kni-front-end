// Icon facade over lucide-react (the Figma icons are Lucide icons). Features use names, never the library.
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Box,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  ClipboardList,
  Copy,
  Ellipsis,
  Eye,
  EyeOff,
  File,
  FileSpreadsheet,
  House,
  ImagePlus,
  Info,
  LoaderCircle,
  LocateFixed,
  LogOut,
  MapPin,
  Minus,
  Pencil,
  Phone,
  Plus,
  Printer,
  Receipt,
  ScanBarcode,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/cn';

const ICONS = {
  home: House,
  products: Box,
  customers: User,
  staff: Users,
  reports: BarChart3,
  more: Ellipsis,
  'chevron-start': ChevronRight,
  'chevron-end': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  back: ChevronRight,
  close: X,
  search: Search,
  scan: ScanBarcode,
  camera: Camera,
  plus: Plus,
  minus: Minus,
  check: Check,
  'check-circle': CheckCircle2,
  'alert-danger': AlertCircle,
  'alert-warning': AlertTriangle,
  info: Info,
  help: CircleHelp,
  calendar: Calendar,
  'map-pin': MapPin,
  locate: LocateFixed,
  trash: Trash2,
  edit: Pencil,
  image: ImagePlus,
  upload: Upload,
  file: File,
  excel: FileSpreadsheet,
  store: Store,
  logout: LogOut,
  settings: Settings,
  eye: Eye,
  'eye-off': EyeOff,
  copy: Copy,
  share: Share2,
  print: Printer,
  phone: Phone,
  receipt: Receipt,
  purchase: ShoppingBag,
  cart: ShoppingCart,
  list: ClipboardList,
  truck: Truck,
  offline: WifiOff,
  spinner: LoaderCircle,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Directional icons flip in LTR; search, camera and barcode never flip (ui-guidelines §14). */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(['chevron-start', 'chevron-end', 'back']);

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Accessible label; decorative icons (default) are hidden from screen readers. */
  label?: string;
};

export function Icon({ name, size = 20, className, strokeWidth = 1.75, label }: IconProps) {
  const Cmp = ICONS[name];
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', DIRECTIONAL.has(name) && 'ltr:-scale-x-100', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable={false}
    />
  );
}
