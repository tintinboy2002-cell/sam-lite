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
} from 'reactstrap';

const DeleteAdocVariable = ({ selectedLog, toggleModal, modal }) => {

  console.log(selectedLog, "delete Adoc Variable");
   const keysToExclude = ["id", "user_id"];

   const filteredData = Object.keys(selectedLog).reduce((acc, key) => {
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
                {Object.keys(filteredData).map((key) => (
                  <th key={key}> {key} </th>
                ))}
              </tr>
             </thead>
             <tbody>
              <tr>
                {Object.values(filteredData).map((value, index) => (
                   <td key={index}>{value}</td>
                ))}
              </tr>
             </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default DeleteAdocVariable;
