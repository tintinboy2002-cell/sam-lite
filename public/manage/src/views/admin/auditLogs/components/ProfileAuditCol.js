import React from 'react';
import { Badge, Flex } from '@chakra-ui/react';


export const Id = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeName = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeId = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const ChangedFields = ({ value }) => {
  if (!value || !Array.isArray(value)) return null;

  return (
    <Flex wrap="wrap" gap={1}>
      {value.map((field, index) => (
        <Badge
          key={index}
          colorScheme="purple"
          variant="subtle"
          borderRadius="md"
          px={2}
          py={0.5}
          fontSize="0.8em"
          textTransform="capitalize"
        >
          {field.replace(/_/g, ' ')}
        </Badge>
      ))}
    </Flex>
  );
};

export const ChangedBy = ({ value }) => {
  return <span>{value || ''}</span>;
};


export const Action = ({ value }) => {
  return <span>{value || ''}</span>;
};
