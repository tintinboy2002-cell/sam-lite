import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Tooltip,
  ConfigProvider,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const HolidayCalendar = () => {
  const [mode, setMode] = useState('month');

  const holidays = useSelector(
    (state) => state.Authentication?.holidaydata || [],
  );

  const holidayMap = useMemo(() => {
    return holidays.reduce((map, item) => {
      map[dayjs(item.date).format('YYYY-MM-DD')] = item.holiday_description;
      return map;
    }, {});
  }, [holidays]);

  const renderHoliday = (current) => {
    const key = current.format('YYYY-MM-DD');
    const holiday = holidayMap[key];

    if (!holiday) return null;

    return (
      <Tooltip title={holiday}>
        <div
          style={{
            marginTop: 6,
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 500,
            color: '#6f42c1',
            background: '#f5f0fa',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {holiday}
        </div>
      </Tooltip>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6f42c1',
          borderRadiusLG: 18,
        },
      }}
    >
      <Row justify="center">
        <Col span={23}>
          <Card
            bordered={false}
            style={{
              marginTop: 40,
              borderRadius: 24,
              boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
            }}
            title={
              <div>
                <Title level={3} style={{ marginBottom: 2 }}>
                  Holiday Calendar
                </Title>
                <Text type="secondary">Official company holidays overview</Text>
              </div>
            }
          >
            <Calendar fullscreen dateCellRender={renderHoliday} />
          </Card>
        </Col>
      </Row>
    </ConfigProvider>
  );
};

export default HolidayCalendar;
