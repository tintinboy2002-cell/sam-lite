import { Button, IconButton } from '@chakra-ui/react';
import { Badge } from 'reactstrap';
import {
  DeleteIcon,
  CheckIcon,
  SmallCloseIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import React from 'react';

const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};
export const LeaveType = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const StartDate = ({ value }) => {
  return <span>{formatDate(value) || ''}</span>;
};

export const EndDate = ({ value }) => {
  return <span>{formatDate(value) || ''}</span>;
};

export const Days = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const AppliedOn = ({ value }) => {
  return <span>{formatDate(value) || ''}</span>;
};

export const EmployeeName = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const EmployeeId = ({ value }) => {
  return <span>{value || ''}</span>;
};

export const Status = ({ value }) => {
  return (
    <Badge
      color={
        value === 'Pending'
          ? 'warning'
          : value === 'Approved'
          ? 'success'
          : 'danger'
      }
      pill
    >
      {value}
    </Badge>
  );
};

export const Actions = ({
  onApprove,
  onReject,
  onViewDetails,
  data,
  getViewDetails,
}) => {
  const onHandleClick = (data) => {
    onViewDetails(true);
    getViewDetails(data.id);
  };

  return data.status === 'Pending' && data.status !== 'deleted' ? (
    <div>
      <IconButton
        colorScheme="purple"
        onClick={() => onApprove(1, data.id)}
        size="xs"
        rounded="3"
      >
        <CheckIcon />
      </IconButton>
      <IconButton
        colorScheme="red"
        size="xs"
        className="mx-2"
        rounded="3"
        onClick={() => onReject(0, data.id)}
      >
        <SmallCloseIcon />
      </IconButton>
      <IconButton
        rounded="3"
        colorScheme="blue"
        size="xs"
        onClick={() => onHandleClick(data)}
      >
        <ViewIcon />
      </IconButton>
    </div>
  ) : (
    <Button
      rounded="3"
      colorScheme="blue"
      size="xs"
      onClick={() => onHandleClick(data)}
    >
      <ViewIcon />
    </Button>
  );
};

export const Delete = ({ data, onOpenModalView, leaveApplicationId }) => {
  const onHandleOpenModal = (value) => {
    onOpenModalView(true);
    leaveApplicationId(value.id);
  };

  const status = data.status ? data.status.trim().toLowerCase() : '';

  return status === 'pending' ? (
    <DeleteIcon onClick={() => onHandleOpenModal(data)} color="red" />
  ) : (
    <span></span>
  );
};
