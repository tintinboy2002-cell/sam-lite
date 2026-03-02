import Login from 'components/auth/login/Login';
import RegisterOrganization from 'components/organization/RegisterOrganization';
import ForgotPassword from 'components/auth/login/ForgotPassword';
import AuthTwostepVerification from 'components/auth/login/TwoFactorAuthenticate';
import ResetPassword from 'components/auth/login/ResetPassword';
import ViewProfile from 'views/admin/directory/components/ViewProfile';
import AddUserComponent from 'views/admin/directory/components/AddUser';
import Holidaypage from 'views/admin/Holiday/components/HolidayList';
import UserManagement from 'components/userManagement/UserManagement';
import OffBoarding from 'components/userManagement/OffBoarding';
import Listorganization from 'components/Superadminaccess/Listorganization';
import SignInOTP from 'components/auth/login/SignInOTP';
import Features from 'views/admin/features/components/Features';
import LoginUI from 'components/auth/login/LoginWithFeature';
import RoleManage from 'components/roleManage/roleManage';


const publicRoutes = [
  { path: '/login', component: LoginUI },
  { path: '/login/forgotpassword', component: ForgotPassword },
  {
    path: '/login/forgotpassword/authenticate',
    component: AuthTwostepVerification,
  },
  { path: '/login/forgotpassword/resetpassword', component: ResetPassword },
  {path:'login/signinotp', component:SignInOTP}
];
 
 
const authProtectedRoutes = [
  { path: '/addUser', component: AddUserComponent },
  { path: '/login/register', component: RegisterOrganization },
  { path: '/profile/:id', component: ViewProfile },
  { path: '/holiday-calender', component: Holidaypage },
  { path: '/user-management', component: UserManagement },
  { path: '/off-boarding', component: OffBoarding },
  {path:'/listorganization', component:Listorganization},
   {path: '/features', component: Features},
   {path: '/role-manage', component: RoleManage}

];
 
export { publicRoutes, authProtectedRoutes };