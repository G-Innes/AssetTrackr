/** The app's pages, shared by the desktop sidebar and the mobile tab bar. */
export const navigation = [
  {
    name: 'Portfolio',
    short: 'Portfolio',
    href: '/dashboard',
    // chart
    icon: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  },
  {
    name: 'Record a trade',
    short: 'Trade',
    href: '/dashboard/asset-manage',
    // two arrows
    icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
  },
  {
    name: 'Transactions',
    short: 'History',
    href: '/dashboard/transactions',
    // list
    icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  },
  {
    name: 'Settings',
    short: 'Settings',
    href: '/dashboard/settings',
    // sliders
    icon: 'M4 6h10m4 0h2M4 12h2m4 0h10M4 18h10m4 0h2M16 4v4M8 10v4M16 16v4',
  },
]
