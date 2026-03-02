import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Container, Card, CardBody, CardTitle, Input } from 'reactstrap';
import { Button } from '@chakra-ui/react';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import './HolidayCalendar.css';

const HolidayCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [holidayDate, setHolidayDate] = useState('');
  const [description, setDescription] = useState('');

  const handleAddHoliday = async () => {
    const holidayData = {
      date: holidayDate, // Use the holidayDate input
      description,
    };
    try {
      const response = await fetch('YOUR_BACKEND_URL/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayData),
      });

      if (response.ok) {
        // Handle success (e.g., show a message, reset inputs)
        setHolidayDate(''); // Reset holiday date
        setDescription(''); // Reset description
      } else {
        // Handle error
        console.error('Failed to add holiday');
      }
    } catch (error) {
    }
  };

  return (
    <Container className="mt-5">
      {/* Calendar Card */}
      <Card className="mb-4" style={{ backgroundColor:'#E1D1F4'}}>
        <CardBody>
          <CardTitle tag="h5" className="text-center">Holiday Calendar</CardTitle>
          <Calendar
            className="react-calendar large-calendar"
            value={date} // Only for rendering
          />
        </CardBody>
      </Card>

      {/* Holiday Input Card */}
      <Card style={{ width: '60%', margin: '0 auto', backgroundColor:'#E1D1F4' }}>
        <CardBody>
          <CardTitle tag="h5" className="text-center">Add Holiday</CardTitle>
          <div className="mb-3">
            <Input
              type="date"
              placeholder="Holiday Date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              style={{width:'70%'}}
            />
          </div>
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Holiday Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{width:'70%'}}
            />
          </div>
          <Button  colorScheme='purple' onClick={handleAddHoliday}>Add Holiday</Button>
        </CardBody>
      </Card>
    </Container>
  );
};

export default HolidayCalendar;
