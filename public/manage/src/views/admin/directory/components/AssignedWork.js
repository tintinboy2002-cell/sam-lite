import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import httpInjectorService from 'services/http-injector.service';
import { Table } from 'reactstrap';
import { Box, Button, Tooltip, Text, Heading, Flex } from '@chakra-ui/react';
import { Empty } from 'antd';

import { Card, CardHeader, CardBody } from 'reactstrap';
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

  const { id } = useParams();

  useEffect(() => {
    // if (activeTab === '4') {
    viewRulesCalendar(id);
    // }
  }, [activeTab]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formattedDate = formatDate(effectiveDate);

  const viewRulesCalendar = async (idd) => {
    setLoading(true);
    try {
      const response = await httpInjectorService.getUserWorkweekRule(idd);
      console.log(response.data, 'getworkweeks');
      if (response.status === 'success') {
        setCalendar(response.data);
        if (response.data.length > 0) {
          setRuleName(response.data[0].work_week_rule_name);
          setDescription(response.data[0].description);
          setEffectiveDate(response.data[0].date);
        }
        console.log(calendar, 'calendar');
      } else {
        // toast.error(response.message, {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      setRenderRules(true);
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading ? (
        <BulletList />
      ) : renderRules && calendar.length > 0 ? (
        // <Card
        //   className="shadow p-1 bg-white mb-3"
        //   style={{ marginTop: '20px' }}
        // >
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
            <Box
              overflowX={{ base: 'auto', md: 'visible' }}
              overflowY="hidden"
              width="100%"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
              }}
              sx={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              <Table
                striped
                style={{
                  width: '100%',
                  textAlign: 'center',
                  minWidth: '600px',
                }}
              >
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
                        console.log(status, 'abcd');
                        let buttonColor;
                        if (status === 'fullday') {
                          buttonColor = 'green';
                        } else if (status === 'halfday') {
                          buttonColor = 'yellow';
                        } else {
                          buttonColor = 'red';
                        }
                        return (
                          <td key={index} style={{ verticalAlign: 'middle' }}>
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
            </Box>
          </CardBody>
        </>
      ) : (
        // </Card>
        <Card
          borderRadius="lg"
          overflow="hidden"
          boxShadow="lg"
          textAlign="center"
          p={3}
        >
          <Flex justify="center" align="center" height="200px">
            {' '}
            {/* Adjust height as needed */}
            <Empty
              description="No workweek assigned"
              style={{ fontSize: '24px' }}
            />
          </Flex>
        </Card>
      )}
    </Box>
  );
};

export default AssignedWork;
