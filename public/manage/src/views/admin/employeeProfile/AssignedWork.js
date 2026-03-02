import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import httpInjectorService from 'services/http-injector.service';
import { Table } from 'reactstrap';
import { Box, Button, Tooltip, Text, Heading, Flex } from '@chakra-ui/react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import Cookies from 'js-cookie';
import { Empty } from 'antd';
import { decryptData } from 'utils/crypto';
import { BulletList } from 'react-content-loader';

const AssignedWork = ({ activeTab }) => {
  const [calendar, setCalendar] = useState([]);
  const [renderRules, setRenderRules] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [loading, setLoading] = useState(true);
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    // if (activeTab === '4') {
    const idd = decryptData(Cookies.get('user_id'));
    viewRulesCalendar(idd);
    // }
  }, [activeTab]);

  const viewRulesCalendar = async (idd) => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getUserWorkweekRule(idd);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 3000,
        });
        setCalendar(response.data);
        if (response.data.length > 0) {
          setRuleName(response.data[0].work_week_rule_name);
          setDescription(response.data[0].description);
          setEffectiveDate(response.data[0].date);
        }
      } else {
      }
    } catch (err) {
      console.log(err, 'console error');
    } finally {
      setRenderRules(true);
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formattedDate = formatDate(effectiveDate);

  return (
    <>
      {loading ? (
        <BulletList />
      ) : (
        <>
          <Box>
            {renderRules && calendar.length > 0 ? (
              <>
                <CardHeader display="flex" alignItems="center">
                  <Box flex="1" textAlign="left">
                    <Text as="b">Description: {description}</Text>
                  </Box>
                  <Box flex="2" textAlign="center">
                    <Heading as="h2" size="lg">
                      {ruleName}
                    </Heading>
                  </Box>
                  <Box flex="1" textAlign="right">
                    <Text as="b">Effective Date: {formattedDate}</Text>
                  </Box>
                </CardHeader>
                <CardBody bg="gray.50">
                  <Table striped style={{ width: '100%', textAlign: 'center' }}>
                    <thead>
                      <tr>
                        <th>Week No</th>
                        {daysOfWeek.map((day) => (
                          <th key={day}>{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, week) => (
                        <tr key={week}>
                          <td>{week + 1}</td>
                          {[...Array(7)].map((_, day) => {
                            const index = week * 7 + day;
                            const status = calendar[index]?.is_working;
                            let buttonColor;
                            if (status === 'fullday') {
                              buttonColor = 'green';
                            } else if (status === 'halfday') {
                              buttonColor = 'yellow';
                            } else {
                              buttonColor = 'red';
                            }
                            return (
                              <td
                                key={index}
                                style={{ verticalAlign: 'middle' }}
                              >
                                <button
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    display: 'block',
                                    margin: '0 auto',
                                    backgroundColor: buttonColor,
                                  }}
                                ></button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardBody>
              </>
            ) : (
              <>
                <Flex justify="center" align="center" height="200px">
                  {' '}
                  {/* Adjust height as needed */}
                  <Empty
                    description="No workweek assigned"
                    style={{ fontSize: '24px' }}
                  />
                </Flex>
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default AssignedWork;
