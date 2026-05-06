import {
  IconLayoutDashboard,
  IconScissors,
  IconMan,
  IconCar,
  IconHome2,
  IconTools,
  IconReport,
} from '@tabler/icons';
import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Guest Entry',
    icon: IconMan,
    href: '/guest-entry',
  },
  {
    navlabel: true,
    subheader: 'Room',
  },
  {
    id: uniqueId(),
    title: 'Room',
    icon: IconHome2,
    href: '/room-management',
  },
  {
    navlabel: true,
    subheader: 'Salon',
  },
  {
    id: uniqueId(),
    title: 'Salon',
    icon: IconScissors,
    href: '/salon-management',
  },
  {
    id: uniqueId(),
    title: 'Salon Report',
    icon: IconReport,
    href: '/salon-report',
  },
  {
    id: uniqueId(),
    title: 'Salon Services',
    icon: IconTools,
    href: '/salon-services',
  },
  {
    navlabel: true,
    subheader: 'Employee Managements',
  },
  {
    id: uniqueId(),
    title: 'Employee',
    icon: IconCar,
    href: '/manage-employee',
  },
  {
    navlabel: true,
    subheader: 'Product Managements',
  },
  {
    id: uniqueId(),
    title: 'Manage Product',
    icon: IconCar,
    href: '/product-manage',
  },
  {
    navlabel: true,
    subheader: 'Agents',
  },
  {
    id: uniqueId(),
    title: 'Manage Agents',
    icon: IconCar,
    href: '/agents',
  },
  {
    navlabel: true,
    subheader: 'Access Control',
  },
  {
    id: uniqueId(),
    title: 'Roles',
    icon: IconTools,
    href: '/roles',
  },
];

export default Menuitems;
