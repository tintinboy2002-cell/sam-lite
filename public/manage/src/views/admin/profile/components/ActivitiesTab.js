import React from 'react';
import { Box, Text, List, ListItem, Flex, Badge } from '@chakra-ui/react';
import { format, addDays, startOfWeek, isWeekend } from 'date-fns';
import PersonalInfoCard from '../UI/PersonalInfoCard';
import ContactInfoCard from '../UI/ContactInfoCard';
import Greeting from '../UI/Greeting';

const formatTime = (totalSeconds) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours} : ${minutes} : ${seconds}`;
};

const getCurrentWeek = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(start, i);
    return {
      day: format(date, 'EEE'),
      date: format(date, 'dd'),
      fullDate: date,
      isWeekend: isWeekend(date),
    };
  });
};

const ActivitiesTab = ({ workLog = [] }) => {
  const weeklyCalendar = getCurrentWeek();
  const startDate = format(weeklyCalendar[0].fullDate, 'dd-MMM-yyyy');
  const endDate = format(weeklyCalendar[6].fullDate, 'dd-MMM-yyyy');


  return (
    <React.Fragment>
      <Box>
        
      {/* GREETING BOX UI */}
        <Greeting/>

        {/* personal and contact Info UI*/}
        <Box>
          <PersonalInfoCard />

          <ContactInfoCard />
        </Box>

        {/* WORK SCHEDULE BOX */}
        <Box
          borderRadius="lg"
          p={4}
          mb={4}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="xs"
          bg="white"
          mt={4}
        >
          <Text fontWeight="semibold" mb={1}>
            Work Schedule
          </Text>
          <Text fontSize="sm" color="gray.600" mb={3}>
            {startDate} — {endDate}
          </Text>

          {/* General Log */}
          <Box
            bg="gray.50"
            borderRadius="lg"
            p={3}
            mb={3}
            boxShadow="xs"
            border="1px solid"
            borderColor="gray.200"
          >
            {workLog.length === 0 ? (
              <Text fontSize="sm" color="gray.400">
                No activity recorded yet.
              </Text>
            ) : (
              <List spacing={1}>
                {workLog.map((time, index) => (
                  <ListItem key={index} fontSize="sm">
                    General : <strong>{formatTime(time)}</strong>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Weekly Calendar */}
          <Box position="relative" mt={6}>
            {/* Horizontal Line above the dates */}
            <Box
              position="absolute"
              top="0"
              left={0}
              right={0}
              height="1px"
              bg="gray.300"
              zIndex={1}
            />

            {/* Dots on the line and dates below */}
            <Flex
              justify="space-between"
              align="center"
              position="relative"
              zIndex={2}
            >
              {weeklyCalendar.map((day, idx) => (
                <Box key={idx} textAlign="center" flex="1">
                  {/* Dot centered on the line */}
                  <Box
                    w="5px"
                    h="5px"
                    borderRadius="full"
                    bg={day.isWeekend ? 'orange.400' : 'gray.500'}
                    mx="auto"
                    mb={2}
                    position="relative"
                    top="-3px"
                  />

                  {/* Date and Day below the line */}
                  <Text fontSize="sm" fontWeight="medium">
                    {day.day} {day.date}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default ActivitiesTab;
