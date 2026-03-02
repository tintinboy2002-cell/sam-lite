import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import ProfileCard from '../components/ProfileCard';
import CustomizableTabs from '../components/CustomizableTabs';
// import { fetchUserProfile } from '../constant/userApi';
import { tabsConfig } from '../constant/tabConfig';
import ActivitiesTab from '../components/ActivitiesTab';

import Education from '../components/Education';
import Family from '../components/family';

import gradient from 'assets/img/gradient.jpg';
// import Work from '../../directory/components/Work';
import Work from './Work';
import EmployeeDoc from 'views/admin/employeeProfile/EmployeeDoc';
import AssignedWork from 'views/admin/employeeProfile/AssignedWork';
import Teams from '../components/Teams';
import Report from '../components/Report';
import httpInjectorService from 'services/http-injector.service';
import SkeletonWithLoaders from 'components/common/Spinner';
import MyProfileReportingPanel from 'views/admin/reporting/MyProfileReportingPanel';
import ReportingContainer from 'views/admin/reporting/ReportingContainer';

const DashboardTab = () => {
  const [user, setUser] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workLog, setWorkLog] = useState([]);
  const [clockInTime, setClockInTime] = useState(null);

  const intervalRef = useRef(null);

  const handleCheckToggle = async () => {
    setIsCheckedIn((prev) => {
      const next = !prev;

      if (next) {
        // When clocking in, refetch to get exact timestamp from backend
        const fetchClockInStatus = async () => {
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
              const now = new Date();
              const elapsed = Math.floor((now - istDate) / 1000);
              setElapsedTime(elapsed);
            } else {
              // Fallback to current time if API doesn't return timestamp
              const now = new Date();
              setClockInTime(now);
              setElapsedTime(0);
            }
          } catch (error) {
            console.error('Error fetching clock in status:', error);
            // Fallback to current time on error
            const now = new Date();
            setClockInTime(now);
            setElapsedTime(0);
          }
        };
        fetchClockInStatus();
      } else {
        // When clocking out, clear timer and reset
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setWorkLog((prevLogs) => [...prevLogs, elapsedTime]);
        setElapsedTime(0);
        setClockInTime(null);
      }

      return next;
    });
  };

  // Fetch clock in status on component mount
  useEffect(() => {
    const fetchClockInStatus = async () => {
      try {
        const response = await httpInjectorService.getclockin();
        const timestamp = response.data;
        if (timestamp) {
          // Convert epoch timestamp to Date
          const date = new Date(timestamp * 1000);
          const istDate = new Date(
            date.toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour12: false,
            }),
          );
          setClockInTime(istDate);
          setIsCheckedIn(true);

          // Calculate initial elapsed time
          const now = new Date();
          const elapsed = Math.floor((now - istDate) / 1000);
          setElapsedTime(elapsed);
        }
      } catch (error) {
        console.error('Error fetching clock in status:', error);
      }
    };

    fetchClockInStatus();
  }, []);

  // Update elapsed time every second if clocked in
  useEffect(() => {
    if (clockInTime && isCheckedIn) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - clockInTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      // Clear interval if not clocked in
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clockInTime, isCheckedIn]);

  // list of tabs and their corresponding components
  const componentsMap = {
    activities: <ActivitiesTab username={user?.username} workLog={workLog} />,
    work: <Work />,
    team: <Teams />,
    report: <ReportingContainer/>,
    education: <Education />,
    family: <Family />,
    documents: <EmployeeDoc />,
    workweek: <AssignedWork />,
  };

  return (
    <>
      {/* Banner with background image */}
      <SkeletonWithLoaders>
        <Box
          position="relative"
          w="100%"
          bgImage={{ base: 'none', md: `url(${gradient})` }}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
          borderRadius="md"
          h={{ base: '30vh', md: '44vh', lg: '30vh' }}
        >
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={6}
            position="relative"
            zIndex={0}
            p={{ base: 0, md: 8 }}
          >
            <Box w={{ base: '100%', md: '100%', lg: '400px' }} flexShrink={0}>
              <ProfileCard
                user={user}
                isCheckedIn={isCheckedIn}
                elapsedTime={elapsedTime}
                onCheckToggle={handleCheckToggle}
              />
            </Box>

            <Box flex="1" overflow="hidden" width="full">
              <CustomizableTabs
                tabsConfig={tabsConfig}
                componentsMap={componentsMap}
              />
            </Box>
          </Flex>
        </Box>
      </SkeletonWithLoaders>
    </>
  );
};

export default DashboardTab;
