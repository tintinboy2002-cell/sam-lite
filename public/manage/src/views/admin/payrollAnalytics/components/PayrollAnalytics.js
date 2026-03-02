import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import CreateStructure from './CreateStructure';
import ListPayrollDetails from './ListPayrollDetails';
import AdocVariable from './AdocVariable';
import SalaryOnHold from './SalaryOnHold';
import RunPayroll from './RunPayroll';
import Payout from './Payout';
import Cookies from 'js-cookie';
import { Empty } from 'antd';
import Payslip from './PaySlip';
import SalaryStructure from './SalaryStructure';
import Overview from './Overview';
import PayrollLogs from './PayrollLogs';
import { decryptData } from 'utils/crypto';
import SkeletonWithLoaders from 'components/common/Spinner';


const PayrollAnalytics = () => {
  const role_id = decryptData(Cookies.get('role_id'));
  const [activeTab, setActiveTab] = useState(
    role_id === 1 || role_id === 2 ? '9' : '7',
  );

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <SkeletonWithLoaders>
      <div style={{ marginTop: '80px' }}>
        <Card className="shadow p-1 bg-white">
          <CardBody>
            <Nav tabs>
              {role_id === 1 || role_id === 2 ? (
                <>
                  <NavItem>
                    <NavLink
                      className={activeTab === '9' ? 'active' : ''}
                      onClick={() => toggleTab('9')}
                      style={{
                        color: activeTab === '9' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Overview
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '1' ? 'active' : ''}
                      onClick={() => toggleTab('1')}
                      style={{
                        color: activeTab === '1' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Assign Structure
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '2' ? 'active' : ''}
                      onClick={() => toggleTab('2')}
                      style={{
                        color: activeTab === '2' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Create Structure
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '3' ? 'active' : ''}
                      onClick={() => toggleTab('3')}
                      style={{
                        color: activeTab === '3' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Run Payroll
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '4' ? 'active' : ''}
                      onClick={() => toggleTab('4')}
                      style={{
                        color: activeTab === '4' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Payout
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '5' ? 'active' : ''}
                      onClick={() => toggleTab('5')}
                      style={{
                        color: activeTab === '5' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Adoc / Variable
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === '6' ? 'active' : ''}
                      onClick={() => toggleTab('6')}
                      style={{
                        color: activeTab === '6' ? 'purple' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      Salary On Hold
                    </NavLink>
                  </NavItem>

                   <NavItem>
                <NavLink className={activeTab==='10'? 'active':''}
                 onClick={()=> toggleTab('10')}
                 style = {{
                  color:activeTab==='10'?'purple':'inherit',
                  cursor:'pointer',
                 }}
                >
                  Logs
                </NavLink>
              </NavItem>
                </>
              ) : null}

              {/* Tabs for all users */}
              <NavItem>
                <NavLink
                  className={activeTab === '7' ? 'active' : ''}
                  onClick={() => toggleTab('7')}
                  style={{
                    color: activeTab === '7' ? 'purple' : 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Pay Slip
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === '8' ? 'active' : ''}
                  onClick={() => toggleTab('8')}
                  style={{
                    color: activeTab === '8' ? 'purple' : 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Salary Structure
                </NavLink>
              </NavItem>
             
            </Nav>

            <TabContent activeTab={activeTab}>
              {role_id === 1 || role_id === 2 ? (
                <>
                  <TabPane tabId="1">
                    <ListPayrollDetails activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="2">
                    <CreateStructure activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="3">
                    <RunPayroll
                      setActiveTab={setActiveTab}
                      activeTab={activeTab}
                    />
                  </TabPane>
                  <TabPane tabId="4">
                    <Payout activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="5">
                    <AdocVariable activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="6">
                    <SalaryOnHold activeTab={activeTab} />
                  </TabPane>
                  <TabPane tabId="9">
                    <Overview activeTab={activeTab} />
                  </TabPane>
                   <TabPane tabId = "10">
                <PayrollLogs activeTab={activeTab}/>
              </TabPane>
                </>
              ) : null}

              <TabPane tabId="7">
                <Payslip activeTab={activeTab} />
              </TabPane>
              <TabPane tabId="8">
                <SalaryStructure activeTab={activeTab} />
              </TabPane>
             
            </TabContent>
          </CardBody>
        </Card>
      </div>
    </SkeletonWithLoaders>
  );
};

export default PayrollAnalytics;
