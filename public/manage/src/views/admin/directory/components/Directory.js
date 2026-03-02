import {
  Avatar,
  Box,
  Flex,
  Text,
  Grid,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import React, { useEffect, useState } from 'react';
import httpInjectorService from 'services/http-injector.service';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Spinner from 'components/common/Spinner';
import { Empty } from 'antd';
import { decryptData } from 'utils/crypto';
import SkeletonWithLoaders from 'components/common/Spinner';

export default function Directory(props) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const navigate = useNavigate();
  const roliId = decryptData(Cookies.get('role_id'));

  const filteredData = data.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      user.username?.toLowerCase().includes(search) ||
      user.Designation?.toLowerCase().includes(search) ||
      user.Department?.toLowerCase().includes(search);

    const matchesDept =
      selectedDepts.length === 0 || selectedDepts.includes(user.Department);

    return matchesSearch && matchesDept;
  });

  useEffect(() => {
    ListOrganization();
    options();
  }, []);

  const ListOrganization = async () => {
    try {
      const response = await httpInjectorService.getActiveUsers();
      if (response.status === 'success') {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const options = async () => {
    try {
      const response = await httpInjectorService.getdepartment();
      if (response.status === 'success') {
        setDepartments(response.data);
      }
    } catch (err) {
      // toast.error('error fetching departments', {
      //   position: 'top-right',
      console.log(err, '');
    }
  };

  return (
    <SkeletonWithLoaders>
    <Box bg="gray.50" minH="100vh" py={10} px={10}>
      <Flex justify="space-between">
        {/* Search Bar */}
        <InputGroup maxW="400px" mt={8} mb={6}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users"
            borderRadius="full"
            border="1px solid"
            borderColor="gray.300"
            bg="white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            _focus={{
              borderColor: 'purple.400',
              boxShadow: '0 0 0 1px #805AD5',
            }}
          />
        </InputGroup>

        <Menu closeOnSelect={false}>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            mt={8}
            mb={6}
            w="200px"
            textAlign="left"
            bg="purple.500"
            color="white"
            _hover={{ bg: 'purple.600' }}
            _active={{ bg: 'purple.700' }}
            borderRadius="md"
            fontWeight="500"
          >
            {selectedDepts.length === 0
              ? 'Departments'
              : selectedDepts.join(', ')}
          </MenuButton>

          <MenuList>
            <MenuItem onClick={() => setSelectedDepts([])}>
              <input
                type="checkbox"
                checked={selectedDepts.length === 0}
                readOnly
                style={{ marginRight: '8px' }}
              />
              All
            </MenuItem>

            {departments.map((dept) => (
              <MenuItem
                key={dept.department_id}
                onClick={() => {
                  setSelectedDepts((prev) =>
                    prev.includes(dept.department_name)
                      ? prev.filter((d) => d !== dept.department_name)
                      : [...prev, dept.department_name],
                  );
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDepts.includes(dept.department_name)}
                  readOnly
                  style={{ marginRight: '8px' }}
                />
                {dept.department_name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      {/* Users Grid */}
      {loading ? (
        <Flex direction="column" align="center" mt="50px">
          <Spinner size="xl" color="purple.500" />
        </Flex>
      ) : filteredData.length > 0 ? (
        <Grid
          mt={roliId === 2 ? 4 : 14}
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={{ base: '20px', xl: '20px' }}
        >
          {filteredData.map((user) => (
            <Card
              key={user.user_id}
              align="center"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="md"
              bg="white"
              p={0}
            >
              {/* Purple Banner with curve */}
              <Box position="relative" w="100%">
                <Box
                  bg="purple.800"
                  h="140px"
                  borderTopRadius="2xl"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  textAlign="center"
                  zIndex={1}
                >
                  <Text fontWeight="bold" fontSize="2xl">
                    {user.username}
                  </Text>
                </Box>

                {/* Curvy Bottom */}
                <Box
                  as="svg"
                  viewBox="0 0 500 80"
                  preserveAspectRatio="none"
                  w="100%"
                  h="50px"
                  mt="-1px"
                  zIndex={0}
                >
                  <path
                    d="M0,0 C150,100 350,0 500,80 L500,00 L0,0 Z"
                    fill="#463178ff"
                  />
                </Box>

                {/* Square Avatar */}
                <Avatar
                  src={
                    user.image_url
                      ? user.image_url
                      : 'avatar-placeholder-url.jpg'
                  }
                  h="120px"
                  w="120px"
                  border="4px solid white"
                  borderRadius="lg"
                  position="absolute"
                  bottom="-45px"
                  left="50%"
                  transform="translateX(-50%)"
                  boxShadow="md"
                />
              </Box>

              {/* Content */}
              <Box pt="60px" pb="20px" textAlign="center">
                <Text fontSize="lg" opacity={0.8}>
                  {user.Designation}
                </Text>
                <Text fontSize="lg" color="gray.600" mb={4}>
                  Department: {user.Department}
                </Text>

                {/* View Profile Button */}
                <Button
                  size="md"
                  borderRadius="full"
                  colorScheme="purple"
                  onClick={() => navigate(`/admin/profile/${user.user_id}`)}
                >
                  View Profile
                </Button>
              </Box>
            </Card>
          ))}
        </Grid>
      ) : (
        <Card mt={2}>
          <Flex justify="center" align="center" height="200px">
            <Empty description="No users found" style={{ fontSize: '24px' }} />
          </Flex>
        </Card>
      )}
    </Box>
    </SkeletonWithLoaders>
  );
}
