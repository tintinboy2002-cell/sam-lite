import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import {
  MdHome,
  MdBusiness,
  MdPerson,
  MdContacts,
  MdEditCalendar,
  MdEvent,
  MdWorkHistory,
  MdAssuredWorkload,
  MdOutlineLan,
  MdNoteAlt,
} from 'react-icons/md';
import MainDashboard from 'views/admin/dashboard/components/Dashboard';
import Attendance from 'views/admin/attendance';
import LeavesList from 'views/admin/leaveManagement/components/LeavesList';
import EmployeeProfile from 'views/admin/employeeProfile/EmployeeProfile';
import CompanyProfile from 'views/admin/companyProfile/components/CompanyProfile';
import Directory from 'views/admin/directory/components/Directory';
import Workweek from 'views/admin/workweek/components/Workweek';
import Payroll from 'views/admin/payrollAnalytics/components/PayrollAnalytics';
import { authProtectedRoutes } from 'routes';
import Cookies from 'js-cookie';
import Operations from 'views/admin/operations';
import ChatBot from 'components/chatbot/ChatBot';
import Announcements from 'views/admin/Announcement/components/Announcements';
import ProfileAudit from 'views/admin/auditLogs/components/ProfileAudit';
import { IoNotifications } from 'react-icons/io5';
import { AiOutlineAudit } from 'react-icons/ai';
import WorkFromHome from 'views/admin/WFH/components/WFHRequest';
import { MdAddHomeWork } from 'react-icons/md';

const componentsMap = {
  MainDashboard,
  Attendance,
  LeavesList,
  EmployeeProfile,
  CompanyProfile,
  Directory,
  Workweek,
  Payroll,
  Operations,
  Announcements,
  ProfileAudit,
  WorkFromHome,
};

const iconsMap = {
  MdHome,
  MdBusiness,
  MdContacts,
  MdEditCalendar,
  MdEvent,
  MdWorkHistory,
  MdPerson,
  MdAssuredWorkload,
  MdOutlineLan,
  IoNotifications,
  AiOutlineAudit,
  MdAddHomeWork,
};

export default function Dashboard(props) {
  // const authUser = Cookies.get('authUser');
  const authUser = localStorage.getItem('authUser'); // Check for authUser
  // Check for authUser
  let parsedData = [];
  try {
    const processedData = localStorage.getItem('accessModules');
    // Only parse if non-empty, valid JSON
    if (processedData && processedData.trim() !== '') {
      parsedData = JSON.parse(processedData);
    }
  } catch (err) {
    console.error('Error parsing accessModules:', err);
    parsedData = [];
  }

  const routes = parsedData.map((item) => {
    return {
      ...item,
      icon: React.createElement(iconsMap[item.icon], {
        width: '20px',
        height: '20px',
        color: 'inherit',
      }),
      component: componentsMap[item.component],
    };
  });

  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { onOpen } = useDisclosure();

  // Redirect to login if authUser is not found
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!sessionStorage.getItem('Logged In')) {
    localStorage.removeItem('authUser');
    return <Navigate to="/login" replace />;
  }

  const getRoute = () => {
    return window.location.pathname !== '/admin/full-screen-maps';
  };

  const getActiveRoute = (routes) => {
    let activeRoute = 'Default Brand Text';
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/admin') {
        return (
          <Route
            path={`${route.path}`}
            element={<route.component />}
            key={key}
          />
        );
      }
      if (route.collapse) {
        return getRoutes(route.items);
      } else {
        return null;
      }
    });
  };

  const getAuthProtectedRoutes = (routes) => {
    return routes.map((route, key) => {
      return (
        <Route path={`${route.path}`} element={<route.component />} key={key} />
      );
    });
  };

  document.documentElement.dir = 'ltr';

  return (
    <Box>
      <Box>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            routes={routes}
            display="none"
            {...rest}
          />
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{
              base: '100%',
              xl: isCollapsed ? 'calc( 100% - 60px )' : 'calc( 100% - 230px )',
            }}
            maxWidth={{
              base: '100%',
              xl: isCollapsed ? 'calc( 100% - 60px )' : 'calc( 100% - 230px )',
            }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  setIsCollapsed={setIsCollapsed}
                  isCollapsed={isCollapsed}
                  onOpen={onOpen}
                  logoText={'SΛM LĪTΞ'}
                  brandText={getActiveRoute(routes)}
                  fixed={fixed}
                  {...rest}
                />
              </Box>
            </Portal>

            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: '20px', md: '30px' }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Routes>
                  {getRoutes(routes)}
                  {getAuthProtectedRoutes(authProtectedRoutes)}
                  <Route
                    path="/"
                    element={<Navigate to="/admin/default" replace />}
                  />
                </Routes>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100px',
                    right: '20px',
                  }}
                >
                  <ChatBot />
                </div>
              </Box>
            ) : null}
            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
