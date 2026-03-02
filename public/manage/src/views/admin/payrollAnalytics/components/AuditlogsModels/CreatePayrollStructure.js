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

const CreatePayrollStructure = ({ selectedLog, toggleModal, modal }) => {
  const keysToExclude = ['user_id', 'org_id'];
 
  const filteredUsers = Object.keys(selectedLog).reduce((acc,key) => {
     if(!keysToExclude.includes(key)) {
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
                {Object.keys(filteredUsers).map(key => (
                   <th key={key}> {key.replace(/_/g, ' ')} </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(filteredUsers).map((value, index) => (
                  <td key={index}> {value} </td>
                ))}
              </tr>
            </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default CreatePayrollStructure;
