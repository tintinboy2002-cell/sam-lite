import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Avatar,
  Flex,
  Text,
  useColorModeValue,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  CardBody,
} from 'reactstrap';
import classnames from 'classnames';
import sampleimg from '../../../../assets/img/organization/organization.png';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { Tab } from 'bootstrap';
import DailyLogs from './DailyLogs';
import MonthlyLogs from './MonthlyLogs';
import AttendanceRecords from './AttendanceRecords';
import { decryptData } from 'utils/crypto';
import EmployeeHistoricalLog from './EmployeeHistoricalLog';
import SkeletonWithLoaders from 'components/common/Spinner';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('1');

const roleId=decryptData(Cookies.get('role_id'));

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <SkeletonWithLoaders> 
      <Card
        className="shadow p-1 bg-white"
        style={{ borderRadius: '10px', marginTop: '80px' }}
      >
        <CardBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => toggleTab('1')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-chat font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Daily Logs</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => toggleTab('2')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-chat font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Historical Logs</span>
              </NavLink>
            </NavItem>
            {roleId === 1 || roleId === 2 ?(
              <>
              <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => toggleTab('3')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-chat font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Attendance Approval</span>
              </NavLink>
            </NavItem>
              <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '4' })}
                onClick={() => toggleTab('4')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-chat font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Employee Historical logs</span>
              </NavLink>
            </NavItem>
            </>
            ):null}
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <DailyLogs activeTab={activeTab} />
            </TabPane>

            <TabPane tabId="2">
              <MonthlyLogs activeTab={activeTab} />
            </TabPane>

            <TabPane tabId="3">
              <AttendanceRecords activeTab={activeTab} />
            </TabPane>
            
            <TabPane tabId="4">
              <EmployeeHistoricalLog activeTab={activeTab} />
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </SkeletonWithLoaders>
  );
};

export default AttendancePage;
