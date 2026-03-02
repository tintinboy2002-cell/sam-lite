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
 
const CreatePayout = ({selectedLog, toggleModal, modal }) => {
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
          <h5> Create Payout </h5>
          <Table>
            <thead>
              <tr>
                <th>username</th>
                 <th>email</th>
              </tr>
              </thead>
              <tbody>
                {selectedLog.map((item, index) => (
                  <tr key={index}>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                  </tr>
                ))}
              </tbody>
          </Table>
        </ModalBody>
         </Modal>
  )
}
 
export default CreatePayout