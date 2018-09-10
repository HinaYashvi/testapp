var routes = [
  // Index page
  {
    path: '/index/',
    url: './index.html',
    name: 'index',
  },
  // Components
  
  {
    path: '/dashboard/',
    url: './dashboard.html',
   // name: 'bookride',
  },
  {
    path: '/complaints/',
    url: './complaints.html',
  },  
  {
    path: '/complaintData/',
    url: './complaintData.html',
  },
  {
    path: '/statusComp/',
    url: './statusComp.html',
  },
  {
    path:'/addComplain/',
    url: './addComplain.html',
  },
  
  /*{
    path: '/action-sheet/',
    componentUrl: './pages/action-sheet.html',
  },*/
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './404.html',
  },
];
