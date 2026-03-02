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



const CreateAdocVariableLogs = ({selectedLog, toggleModal, modal}) => {
  console.log("adoc/variable")
  
   const excludeKey = 'user_id';
  const filteredData = Object.keys(selectedLog).reduce((acc,key) => {
    if(!excludeKey.includes(key)){
        acc[key] = selectedLog[key];
    }
    return acc;
  }, {});

  return (
     <Modal isOpen={modal} toggle={toggleModal} size="xl" centered style={{ maxWidth: '70vw' }}>
               <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
               <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                     <Table>
                      <thead> 
                        <tr>
                         {Object.keys(filteredData).map((key) => (
                           <th key={key}>{key}</th>
                         ))}
                         </tr>
                         </thead>
                         <tbody>
                           <tr>
                            {Object.values(filteredData).map((value, index)=> (
                               <td key={index}> {value}</td> 
                            ))}
                           </tr>
                         </tbody>
                     </Table>
                </ModalBody>
            </Modal>
  )
}

export default CreateAdocVariableLogs