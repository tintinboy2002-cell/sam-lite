// Chakra Imports
import {
  Avatar,
  Flex,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  IconButton,
  Box,
  Badge,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useMediaQuery } from '@chakra-ui/react';
// Custom Components
import { ItemContent } from 'components/menu/ItemContent';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import userimage from '../../assets/img/auth/Default_profileoic.jpg';
// Assets
import { MdLogout, MdNotificationsNone } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from 'routes';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Spinner } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import MainDashboard from 'views/admin/default';
import EmployeeProfile from 'views/admin/employeeProfile/EmployeeProfile';
import CompanyProfile from 'views/admin/companyProfile/components/CompanyProfile';
import Attendance from 'views/admin/attendance';
import LeavesList from 'views/admin/leaveManagement/components/LeavesList';
import WorkFromHome from 'views/admin/WFH/components/WFHRequest';
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
import Directory from 'views/admin/directory/components/Directory';
import Payroll from 'views/admin/payrollAnalytics/components/PayrollAnalytics';
import { dailylogs } from 'store/actions';
import { setEmployeesDailyLogs } from 'store/actions';
import { setEmployeesMonthlyLogs } from 'store/actions';
import Operations from 'views/admin/default';
import Announcements from 'views/admin/Announcement/components/Announcements';
import { decryptData } from 'utils/crypto';
import { IoNotifications } from 'react-icons/io5';
import { AiOutlineAudit } from 'react-icons/ai';
import ProfileAudit from 'views/admin/auditLogs/components/ProfileAudit';
import { FaUserPlus } from 'react-icons/fa';
import { MdAddHomeWork } from "react-icons/md";


import { listenForMessages } from '../../firebase/notificationService';
// import { requestForToken } from '../../firebase/notificationService';

const componentsMap = {
  MainDashboard,
  EmployeeProfile,
  CompanyProfile,
  Attendance,
  LeavesList,
  Directory,
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

// Helper function to convert epoch time to IST
const epochToIST = (epochTime) => {
  const date = new Date(epochTime * 1000); // Convert seconds to milliseconds
  return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
};

// Helper function to format the date without time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

export default function HeaderLinks(props) {
  //  //announcement
  const [notifications, setNotifications] = useState(0); // count
  const [notificationList, setNotificationList] = useState([]); // list

  const { secondary } = props;
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const ethColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const ethBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );

  const formatDate = () => {
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(today);
    return formattedDate.replace(',', '');
  };

  // Clock In/Out Logic
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [loading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [image, setImage] = useState('');
  const [isDesktop] = useMediaQuery('(min-width: 769px)');
  const roleid = decryptData(Cookies.get('role_id'));
  const dispatch = useDispatch();
  const [range, setDateRange] = useState({ fromDate: null, toDate: null });
  const email = Cookies.get("email")
  const username = Cookies.get("username")

  const navigate = useNavigate();
  const profileimage = useSelector((state) => state);
  const profileData = profileimage.Authentication.profiledata;

  const processedData = localStorage.getItem('accessModules');
  const parsedData = JSON.parse(processedData);

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

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await httpInjectorService.getclockin();
        const timestamp = response.data;
        if (timestamp) {
          const date = new Date(timestamp * 1000);
          const istDate = new Date(
            date.toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour12: false,
            }),
          );
          setClockInTime(istDate);
          setIsClockedIn(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getDetails();
  }, []);

  useEffect(() => {
    let interval;
    if (clockInTime) {
      setIsLoading(true);
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = new Date(now - clockInTime);
        const hours = String(elapsed.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
        setIsLoading(false);
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockInTime]);

  const fetchEmployees = async () => {
    try {
      const response = await httpInjectorService.dailylogs();
      if (response?.data) {
        const updatedEmployees = response.data.map((employee) => ({
          ...employee,
          id: employee.Employee_id,
          formattedDate: formatDate(employee.date),
          formattedClockIn: employee.clock_In
            ? epochToIST(employee.clock_In)
            : '',
          formattedClockOut: employee.clock_out
            ? epochToIST(employee.clock_out)
            : '',
        }));

        dispatch(setEmployeesDailyLogs(updatedEmployees));
      } else {
        dispatch(setEmployeesDailyLogs([]));
      }
    } catch (error) {
      dispatch(setEmployeesDailyLogs([]));
    }
  };

  const fetchMonthlyLogs = async (range) => {
    try {
      const response = await httpInjectorService.monthlylogs(range);
      if (response?.data) {
        const updatedData = response.data.map((Employee) => ({
          ...Employee,
          formattedDate: formatDate(Employee.date),
          formattedClockIn: Employee.firstclockin
            ? epochToIST(Employee.firstclockin)
            : '--',
          formattedClockOut: Employee.lastclockout
            ? epochToIST(Employee.lastclockout)
            : '--',
        }));

        dispatch(setEmployeesMonthlyLogs(updatedData));
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 2);
    setDateRange({
      fromDate: formatLocalDate(thirtyDaysAgo),
      toDate: formatLocalDate(today),
    });
  }, []);

  const handleClockIn = async () => {
    try {
      const response = await httpInjectorService.clockin();
      if (response.status === 'success') {
        const now = new Date();
        setClockInTime(now);
        setIsClockedIn(true);
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        fetchEmployees();
        fetchMonthlyLogs(range);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error('Error Clocking in', error);
      toast.error('Failed to clock in. Please try again later.', {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await httpInjectorService.clockout();
      if (response.status === 'success') {
        setClockInTime(null);
        setElapsedTime('00:00:00');
        setIsClockedIn(false);
        localStorage.removeItem('clockInTime');
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        fetchEmployees();
        fetchMonthlyLogs(range);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error('Failed to clock out. Please try again later.', {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };

  const logoutHandler = async () => {
    try {
      const response = await httpInjectorService.LogOut();
      if (response.status === 'success') {
        // await deleteDeviceTokenOnLogout();
        Cookies.remove('authUser');
        Cookies.remove('userRole');
        Cookies.remove('email');
        Cookies.remove('role_id');
        Cookies.remove('org_id');
        Cookies.remove('user_id');
        navigate('/login');
      } else {
        console.log(response);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updatePasswordHandler = () => {
    navigate('/login/forgotpassword');
  };

  const getData = async () => {
    try {
      const id = decryptData(Cookies.get('user_id'));
      if (!id) {
        throw new Error('Role ID not found in cookies');
      }

      const response = await httpInjectorService.getProfiledetails(id);
      if (response.status === 'success') {
        const profileData = response.data[0];
        setImage(profileData.image_url);
      } else {
        // toast.error('Failed to get image');
      }
    } catch (error) {
      console.error('Error fetching profile data', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Foreground message listener
  useEffect(() => {
    listenForMessages((payload) => {
      const { title, body } = payload.notification || {};

      setNotificationList((prevList) => [
        {
          title,
          message: body,
          data: payload.data || {},
        },
        ...prevList,
      ]);

      setNotifications((prevCount) => prevCount + 1);
    });

    return () => {
      console.log('Foreground listener cleaned up');
    };
  }, []);

  useEffect(() => {
    // Add class to body or container only on specific pages
    if (location.pathname === '/page-with-scroll') {
      document.body.classList.add('hide-scrollbar');
    } else {
      document.body.classList.remove('hide-scrollbar');
    }

    return () => {
      document.body.classList.remove('hide-scrollbar');
    };
  }, [location]);

  // Automatic Logout Logic after 30mins
  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, 1800000); // 30 minutes
    };

    const logout = async () => {
      try {
        const response = await httpInjectorService.LogOut();
        if (response.status === 'success') {
          // await deleteDeviceTokenOnLogout();
          Cookies.remove('authUser');
          Cookies.remove('userRole');
          Cookies.remove('email');
          Cookies.remove('role_id');
          Cookies.remove('org_id');
          Cookies.remove('user_id');
          navigate('/login');
        } else {
          console.log(response);
        }
      } catch (err) {
        console.log(err);
      }
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Start the timeout when the component mounts
    handleActivity();

    // Cleanup event listeners and timeout on unmount
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [navigate]);

  const onNotification = () => {
    setNotifications(0);
  };

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      // display="flex"
      justifyContent="space-between"
      flexDirection="row"
      // bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      // p="10px"
      borderRadius="20px"
      boxShadow={shadow}
    >
      <Menu>{/* Menu items can go here */}</Menu>

      <Flex direction="row" align="center" justify="center">
        <SidebarResponsive routes={routes} />

        <Flex direction="column">
          {isDesktop && (
            <span
              className="text-uppercase"
              style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                marginTop: '-13px',
              }}
            >
              {formatDate()}
            </span>
          )}

          <Button
            colorScheme={isClockedIn ? 'blue' : 'red'}
            size="sm"
            onClick={isClockedIn ? handleClockOut : handleClockIn}
            variant="solid"
            borderRadius="md"
            boxShadow={isClockedIn ? 'md' : 'none'}
            transition="all 0.3s"
            ml="10px"
            mr="10px"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            _hover={{
              bg: 'green',
            }}
          >
            <Flex align="center" justify="center">
              {loading && (
                <Spinner color="light" style={{ marginLeft: '5px' }} />
              )}
              {!loading && (
                <Flex direction="column" align="center" justify="center">
                  {isHovered ? (
                    isClockedIn ? (
                      'CLOCK OUT'
                    ) : (
                      'CLOCK IN'
                    )
                  ) : (
                    <>
                      {isClockedIn ? (
                        <>
                          <div>CLOCKED IN</div>
                          <div style={{ fontSize: '0.7rem' }}>
                            {elapsedTime}
                          </div>
                        </>
                      ) : (
                        'CLOCK IN'
                      )}
                    </>
                  )}
                </Flex>
              )}
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {/* Profile UI here */}
      <Box
        ml="10px"
        mt="-2"
        display="flex"
        alignItems="center"
        gap="8px"
        borderRadius="3xl"
        border="2px solid"
        backgroundColor="gray.100"
        borderColor="gray.200"
        p="6px 8px"
      >
        <Menu placement='bottom-start' strategy='fixed'>
          <MenuButton p="0">
            <Avatar
              src={image || userimage}
              size="md"
              cursor="pointer"
              border="2px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            />
          </MenuButton>

          <MenuList
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            p="0"
            mt="12px"
            borderRadius="20px"
            bg={menuBg}
            minW="280px"
            overflow="hidden"
          >
            {/* Profile Header Like Image */}
            <Box p="16px" borderBottom="1px solid" borderColor={borderColor}>
              <Flex align="center" gap="12px">
                <Avatar size="md" src={image || userimage} />
                <Box>
                  <Text fontWeight="bold">
                    {username}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {email}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Menu Items Section */}
            <Box p="10px">
              {(roleid === 1 || roleid === 2) && (
                <>
                   <MenuItem
                    icon={<FaUserPlus />}
                    borderRadius="12px"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/admin//role-manage')}
                  >
                    Create Role
                  </MenuItem>
                  <MenuItem
                    icon={<MdPerson />}
                    borderRadius="12px"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/admin/user-management')}
                  >
                    User Management
                  </MenuItem>

                  <MenuItem
                    icon={<MdBusiness />}
                    borderRadius="12px"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/admin/off-boarding')}
                  >
                    Off Boarding
                  </MenuItem>
                </>
              )}

              {roleid === 1 && (
                <MenuItem
                  icon={<MdOutlineLan />}
                  borderRadius="12px"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => navigate('/admin/features')}
                >
                  Features
                </MenuItem>
              )}

              <MenuItem
                icon={<MdEditCalendar />}
                borderRadius="12px"
                _hover={{ bg: 'gray.100' }}
                onClick={updatePasswordHandler}
              >
                Update Password
              </MenuItem>
            </Box>

            <Box borderTop="1px solid" borderColor={borderColor} p="10px">
              <MenuItem
                icon={<MdLogout />}
                borderRadius="12px"
                color="red.500"
                fontWeight="600"
                _hover={{ bg: 'red.50' }}
                onClick={logoutHandler}
              >
                Logout
              </MenuItem>
            </Box>
          </MenuList>
        </Menu>
        <Flex align="center" justify="center" position="relative">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Notifications"
              variant="ghost"
              fontSize="24px"
              position="relative"
              backgroundColor="gray.200"
              onClick={onNotification}
            >
              <Box position="relative">
                <BellIcon fontSize="24px" />

                {notifications > 0 && (
                  // count UI
                  <Box
                    backgroundColor="red.600"
                    color="white"
                    borderRadius="full"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="0.5em"
                    px="5px"
                  >
                    {notifications}
                  </Box>
                )}
              </Box>
            </MenuButton>

            <MenuList boxShadow="lg" borderRadius="12px" p="10px" minW="300px">
              <Text fontWeight="bold" mb="8px">
                Notifications
              </Text>

              {notificationList && notificationList.length > 0 ? (
                notificationList.slice(0, 5).map((note, index) => (
                  <MenuItem
                    key={index}
                    py="8px"
                    _hover={{ bg: 'gray.200' }}
                    backgroundColor="gray.100"
                    width="100%"
                    borderRadius="8px"
                  >
                    <Flex direction="column" align="flex-start">
                      <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                        {note.title || 'No title'}
                      </Text>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {note.message || ''}
                      </Text>
                    </Flex>
                  </MenuItem>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  No new notifications
                </Text>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  secondary: PropTypes.bool,
};
