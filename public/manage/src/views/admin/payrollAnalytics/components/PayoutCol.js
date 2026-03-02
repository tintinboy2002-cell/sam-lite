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

export const LopDays = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const NetPay = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const CtcPerMonth = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const CtcPerAnnual = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const BasicMonth = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const HraMonth = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const AdocAndVariable = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const Status = ({ value }) => {
  return (
    <Badge
      color={
        value === 'SALARY ON HOLD'
          ? 'warning'
          : value === 'Paid'
          ? 'success'
          : 'primary'
      }
      pill
    >
      {value}
    </Badge>
  );
};
