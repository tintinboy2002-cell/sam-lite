import Cookies from 'js-cookie';
import sun from 'assets/img/sun.png';
import cloudy from 'assets/img/cloudy.png';
import evening from 'assets/img/Evening.png';
import moon from 'assets/img/moon.png';
import { Box, Text, List, ListItem, Flex, Badge } from '@chakra-ui/react';

// Greeting UI
const Greeting = () => {

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 16) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'night';
  };

  const username = Cookies.get('username') || 'User';
  const greeting = getGreeting();

  return (
    <>
      <Box
        borderRadius="lg"
        // p={4}
        mb={4}
        // border="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        boxShadow="xs"
      >
        <Flex
          align="center"
          justify="space-between"
          bgGradient={
            greeting === 'Morning'
              ? 'linear(to-r, white, blue.200)'
              : greeting === 'Afternoon'
              ? 'linear(to-r, orange.300 , yellow.200)'
              : greeting === 'Evening'
              ? 'linear(to-r, purple.400, pink.300)'
              : 'linear(to-r, purple.300, blue.800)'
          }
          p={4}
          borderRadius="lg"
        >
          <Text fontSize="md" fontWeight="bold">
            Good {greeting}, {username}
            <Text
              mt={2}
              color={
                greeting === 'Morning'
                  ? 'gray.700'
                  : greeting === 'Afternoon'
                  ? 'white'
                  : greeting === 'Evening'
                  ? 'white'
                  : 'white'
              }
            >
              Have a productive day ☺️!
            </Text>
          </Text>
          <Box>
            {greeting === 'Morning' ? (
              <>
                <Box mt={2} fontSize="sm" color="gray.600">
                  <img
                    src={sun}
                    alt="Sun"
                    style={{
                      width: '200px',
                      verticalAlign: 'middle',
                      marginRight: '6px',
                    }}
                  />
                </Box>
              </>
            ) : greeting === 'Afternoon' ? (
              <>
                <Box mt={2} fontSize="sm" color="gray.600">
                  <img
                    src={cloudy}
                    alt="Afternoon"
                    style={{
                      width: '100px',
                      verticalAlign: 'middle',
                      marginRight: '6px',
                    }}
                  />
                </Box>
              </>
            ) : greeting === 'Evening' ? (
              <>
                <Box mt={2} fontSize="sm" color="gray.600">
                  <img
                    src={evening}
                    alt="Evening"
                    style={{
                      width: '100px',
                      verticalAlign: 'middle',
                      marginRight: '6px',
                    }}
                  />
                </Box>
              </>
            ) : greeting === 'night' ? (
              <>
                <Box mt={2} fontSize="sm" color="gray.600">
                  <img
                    src={moon}
                    alt="Moon"
                    style={{
                      width: '100px',
                      verticalAlign: 'middle',
                      marginRight: '6px',
                    }}
                  />
                </Box>
              </>
            ) : null}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Greeting;
