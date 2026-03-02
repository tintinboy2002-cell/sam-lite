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

const UpdatePayrollDetails = ({ toggleModal, modal, selectedLog }) => {

   console.log(selectedLog, "selllog");
  const keysToExclude = ['user_id', 'email', 'username'];
  const filteredData = Object.keys(selectedLog).reduce((acc, key) => {
    if (!keysToExclude.includes(key) && key !== 'oldData') {
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
      style={{ maxWidth: '40vw' }}
    >
      <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
      <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <span><strong>username:</strong></span> <span>{selectedLog.username}</span>
        <span>{"  "}</span>
        <span style={{marginLeft:'40px'}}><strong>email:</strong></span> <span> {selectedLog.email}</span>
       
        <Table style={{marginTop:'20px'}}>
          <thead>
            <tr>
              {Object.keys(selectedLog.oldData[0]).map((key) => (
                <th key={key}>{key.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedLog.oldData.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx} style={{ color: 'red' }}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
             <tr>
              {Object.values(filteredData).map((value, index) => (
                <td key={index} style={{ color: 'green' }}>
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        </Table>

        {/* <h2>Current Data</h2> */}
        <Table>
          {/* <thead>
            <tr>
              {Object.keys(filteredData).map((key) => (
                <th key={key}>{key.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead> */}
          <tbody>
           
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default UpdatePayrollDetails;
