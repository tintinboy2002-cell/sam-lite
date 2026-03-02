import leave from '../../../../assets/img/dashboards/leave.png';
import attendance from '../../../../assets/img/dashboards/attendance.png';
import directory from '../../../../assets/img/dashboards/directory.svg';
import payroll from '../../../../assets/img/dashboards/payroll.png';
import profile from '../../../../assets/img/dashboards/profile.png';
import holidayCalender from '../../../../assets/img/dashboards/holidayCalender.png';
import companyProfile from '../../../../assets/img/dashboards/companyProfile.webp';
import workweek from '../../../../assets/img/dashboards/workweek.png'

const dashboardData = [
  {
    id: 1,
    name: 'Company Profile',
    image: companyProfile,
    path: '/admin/company-profile',
  },
  {
    id: 2,
    name: 'My Profile',
    image: profile,
    path: '/admin/my-profile',
  },
  {
    id: 3,
    name: 'Directory',
    image: directory,
    path: '/admin/directory',
  },
  {
    id: 4,
    name: 'Attendance',
    image: attendance,
    path: '/admin/attendance',
  },
  {
    id: 5,
    name: 'Leave',
    image: leave,
    path: '/admin/leaves',
  },

  {
    id: 6,
    name: 'Payroll',
    image: payroll,
    path: '/admin/payroll',
  },
  {
    id: 7,
    name: 'Holiday Calender',
    image: holidayCalender,
    path: '/admin/holiday-calender',
  },
  {
    id: 8,
    name: 'Workweek',
    image: workweek,
    path: '/admin/workweek',
  },
];

export default dashboardData;
