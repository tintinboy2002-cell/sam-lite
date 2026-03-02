import React from 'react';
import { Badge } from '@chakra-ui/react';

export const Id = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeName = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeId = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const LopDays = ({ value }) => {
  return <span>{value || 0}</span>;
};

export const NetPay = ({ value }) => {
  return <span>{value || 0}</span>;
};

export const AdocAndVariable = ({ value }) => {
  const getBadgeColor = () => {
    if (value < 0) return 'red'; 
    if (value > 0) return 'green';
    return 'purple';
  };

  return <Badge colorScheme={getBadgeColor()}>{value ?? 0}</Badge>;
};

export const CtcPerMonth = ({ value }) => {
  return <span>{value || 0}</span>;
};

export const CtcPerAnnual = ({ value }) => {
  return <span>{value || 0}</span>;
};

export const BasicMonth = ({ value }) => {
  return <span>{value || 0}</span>;
};

export const HraMonth = ({ value }) => {
  return <span>{value || 0}</span>;
};
