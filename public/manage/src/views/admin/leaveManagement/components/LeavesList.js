import React, { useState } from 'react';
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
import EmployeeLogs from './EmployeeLogs';
import Rules from './Rules';
import { BulletList } from 'react-content-loader';
import ApplyLeave from './ApplyLeave';
import LeaveRecords from './LeaveRecords';
import Cookies from 'js-cookie';
import { decryptData } from 'utils/crypto';
import SkeletonWithLoaders from 'components/common/Spinner';
 
const LeavesList = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const roleId = decryptData(Cookies.get('role_id'));
 
  const toggleTab = (tab) => {
    console.log(tab, "tab")
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }; 
 
  return (
    <SkeletonWithLoaders>
    <div style={{ borderRadius: '10px', marginTop: '20px' }}>
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
                <span className="d-none d-sm-block">Apply Leave</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => toggleTab('2')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-group font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Logs</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => toggleTab('3')}
                style={{ cursor: 'pointer', color: 'purple' }}
              >
                <i className="bx bx-group font-size-20 d-sm-none" />
                <span className="d-none d-sm-block">Rules</span>
              </NavLink>
            </NavItem>
             {roleId === 1 || roleId === 2 ? (
  <NavItem>
    <NavLink
      className={classnames({ active: activeTab === '4' })}
      onClick={() => toggleTab('4')}
      style={{ cursor: 'pointer', color: 'purple' }}
    >
      <i className="bx bx-group font-size-20 d-sm-none" />
      <span className="d-none d-sm-block">Leave Records</span>
    </NavLink>
  </NavItem>
) : null}
          </Nav>
          {loading ? (
            <div>
              <BulletList />
            </div>
          ) : (
            <div>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <ApplyLeave activeTab={activeTab}></ApplyLeave>
                </TabPane>
                <TabPane tabId="2">
                  <EmployeeLogs activeTab={activeTab} />
                </TabPane>
                <TabPane tabId="3">
                  <Rules activeTabMain={activeTab} />
                </TabPane>
                <TabPane tabId="4">
                  <LeaveRecords activeTab={activeTab} />
                </TabPane>
              </TabContent>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
    </SkeletonWithLoaders>
  );
};
 
export default LeavesList;