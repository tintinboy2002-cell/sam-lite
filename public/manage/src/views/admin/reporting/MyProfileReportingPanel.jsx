import React from 'react';
import { Box, Button, Spinner ,IconButton, } from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';

const MyProfileReportingPanel = ({
  users,
  setUsers,
  currentUserId,
  isAdmin
}) => {

  const currentUser = users.find(u => u.id === currentUserId);

  if (!currentUser) return null;

  const authorities = currentUser.reportingAuthorities || [];

  return (
    <Box mt={6}>
      <Box fontWeight="bold" mb={3}>
        Reporting Authorities
      </Box>

      {authorities.length === 0 && (
        <Box>No reporting authority assigned.</Box>
      )}

      {authorities.map(auth => (
        <Box key={auth.id} p={3} borderWidth="1px" mb={2}>
          <div>{auth.name}</div>
          <div>{auth.department}</div>
          <div>{auth.designation}</div>
        </Box>
      ))}
    </Box>
  );
};

export default MyProfileReportingPanel;