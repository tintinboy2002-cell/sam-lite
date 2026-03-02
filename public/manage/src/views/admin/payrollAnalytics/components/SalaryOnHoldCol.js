import React from 'react';
import { Badge } from 'reactstrap';

export const Id = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeName = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeId = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const PayAction = ({ value = 'On Hold' }) => {
  return <Badge color="warning">{value}</Badge>;
};
