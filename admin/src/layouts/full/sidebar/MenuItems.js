import {
  IconLayoutDashboard,
  IconMan,
  IconCar,
  IconHome2,
  IconTools,
  IconReport,
  IconBrandWhatsapp,
} from '@tabler/icons';
import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
    subheaderKey: 'sidebar.home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    titleKey: 'sidebar.dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Guest Entry',
    titleKey: 'sidebar.guestEntry',
    icon: IconMan,
    href: '/guest-entry',
  },
  {
    navlabel: true,
    subheader: 'Room',
    subheaderKey: 'sidebar.room',
  },
  {
    id: uniqueId(),
    title: 'Room',
    titleKey: 'sidebar.room',
    icon: IconHome2,
    href: '/room-management',
  },
  {
    navlabel: true,
    subheader: 'Employee Managements',
    subheaderKey: 'sidebar.employeeManagements',
  },
  {
    id: uniqueId(),
    title: 'Employee',
    titleKey: 'sidebar.employee',
    icon: IconCar,
    href: '/manage-employee',
  },
  {
    navlabel: true,
    subheader: 'Product Managements',
    subheaderKey: 'sidebar.productManagements',
  },
  {
    id: uniqueId(),
    title: 'Manage Product',
    titleKey: 'sidebar.manageProduct',
    icon: IconCar,
    href: '/product-manage',
  },
  {
    navlabel: true,
    subheader: 'Agents',
    subheaderKey: 'sidebar.agents',
  },
  {
    id: uniqueId(),
    title: 'Manage Agents',
    titleKey: 'sidebar.manageAgents',
    icon: IconCar,
    href: '/agents',
  },
  {
    navlabel: true,
    subheader: 'WhatsApp',
    subheaderKey: 'sidebar.whatsApp',
  },
  {
    id: uniqueId(),
    title: 'WA Templates',
    titleKey: 'sidebar.waTemplates',
    icon: IconBrandWhatsapp,
    href: '/whatsapp-templates',
  },
  {
    navlabel: true,
    subheader: 'Access Control',
    subheaderKey: 'sidebar.accessControl',
  },
  {
    id: uniqueId(),
    title: 'Roles',
    titleKey: 'sidebar.roles',
    icon: IconTools,
    href: '/roles',
  },
];

export default Menuitems;
