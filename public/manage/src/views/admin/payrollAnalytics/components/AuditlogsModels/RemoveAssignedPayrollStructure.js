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

const RemoveAssignedPayrollStructure = ({ toggleModal, modal, selectedLog }) => {

   const keysToExclude = ["id","user_id", "payroll_structure_id", "created_by"]; 

   const filteredData = Object.keys(selectedLog).reduce((acc, key) => {
       if(!keysToExclude.includes(key)){
        acc[key] = selectedLog[key];
       }
       return acc;
   }, {});

   const isIsoDateString = (value) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return isoDateRegex.test(value);
  };


  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // Formats the date using the browser's locale
  };

  console.log(selectedLog, "remove assigned structure");
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
                  {Object.keys(filteredData).map(key => (
                    <th key={key}> {key.replace(/_/g, ' ')} </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(filteredData).map((value, index) => (
                    <td key={index} > {isIsoDateString(value) ? formatDate(value) : value}</td>
                  ))}
                </tr>
              </tbody>
           </Table>
        </ModalBody>
        </Modal>
  )
}

export default RemoveAssignedPayrollStructure