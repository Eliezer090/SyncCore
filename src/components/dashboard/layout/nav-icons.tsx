import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChatCircleIcon } from '@phosphor-icons/react/dist/ssr/ChatCircle';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { CreditCardIcon } from '@phosphor-icons/react/dist/ssr/CreditCard';
import { CubeIcon } from '@phosphor-icons/react/dist/ssr/Cube';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { HouseIcon } from '@phosphor-icons/react/dist/ssr/House';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { MapPinIcon } from '@phosphor-icons/react/dist/ssr/MapPin';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { ScissorsIcon } from '@phosphor-icons/react/dist/ssr/Scissors';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { StackIcon } from '@phosphor-icons/react/dist/ssr/Stack';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { UsersFourIcon } from '@phosphor-icons/react/dist/ssr/UsersFour';
import { WarehouseIcon } from '@phosphor-icons/react/dist/ssr/Warehouse';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  // Novos ícones
  buildings: BuildingsIcon,
  'users-four': UsersFourIcon,
  'user-circle': UserCircleIcon,
  'list-bullets': ListBulletsIcon,
  cube: CubeIcon,
  stack: StackIcon,
  scissors: ScissorsIcon,
  warehouse: WarehouseIcon,
  'shopping-cart': ShoppingCartIcon,
  'credit-card': CreditCardIcon,
  calendar: CalendarIcon,
  'map-pin': MapPinIcon,
  clock: ClockIcon,
  'chat-circle': ChatCircleIcon,
  house: HouseIcon,
  package: PackageIcon,
  prohibit: ProhibitIcon,
  'shield-check': ShieldCheckIcon,
} as Record<string, Icon>;
