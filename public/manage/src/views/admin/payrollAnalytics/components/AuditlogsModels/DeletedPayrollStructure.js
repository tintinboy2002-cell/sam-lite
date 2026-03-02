import React from 'react';
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  Collapse,
  Th,
} from 'reactstrap';

const DeletedPayrollStructure = ({ selectedLog, toggleModal, modal }) => {
  console.log(selectedLog, 'delete payrollStructure');

  const excludeKey = ['id', 'updated_at', 'updated_by'];
  const filteredData = Object.keys(selectedLog).reduce((acc, key) => {
    if (!excludeKey.includes(key)) {
      acc[key] = selectedLog[key];
    }
    return acc;
  }, {});

  return (
    <Modal
      isOpen={modal}
      toggle={toggleModal}
      size="xl"
      centered
      style={{ maxWidth: '90vw' }}
    >
      <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
      <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Table>
          <thead>
            <tr>
              {Object.keys(filteredData).map((key) => (
                <th key={key}>{key.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              {Object.values(filteredData).map((value, index) => (
                <td key={index}> {value} </td>
              ))}
            </tr>
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default DeletedPayrollStructure;
