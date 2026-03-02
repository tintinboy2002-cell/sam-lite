import React from 'react'
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
 
const GeneratePayslip = ({ toggleModal, modal, selectedLog }) => {
  return (
    <Modal
      isOpen={modal}
      toggle={toggleModal}
      size="l"
      centered
      //  style={{ maxWidth: "90vw" }}
    >
      <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
      <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h5> Generate Payslip </h5>
        <Table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
 
          <tbody>
            {selectedLog.map((item, index) => (
              <tr>
                <td key={index}>{item.username}</td>
                <td key={index}>{item.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};
 
export default GeneratePayslip;