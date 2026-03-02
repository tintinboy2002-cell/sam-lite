import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';

const AssignedPayrollStructure = ({ selectedLog, toggleModal, modal }) => {
  const [isOldPresent, setIsOldPresent] = useState(false);
  const [isNewPresent, setIsNewPresent] = useState(false);

  useEffect(() => {
    // Set flags based on record existence
    setIsOldPresent(
      selectedLog.old_records && selectedLog.old_records.length > 0,
    );
    setIsNewPresent(
      selectedLog.new_records && selectedLog.new_records.length > 0,
    );
  }, [selectedLog]);

  console.log(selectedLog, 'new assigned structure');

  return (
    <Modal
      isOpen={modal}
      toggle={toggleModal}
      size="xl"
      centered
      style={{ maxWidth: '97vw' }}
    >
      <ModalHeader toggle={toggleModal}>Payroll Logs</ModalHeader>
      <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {isOldPresent && (
          <>
            <h3>Updated Payroll Structure</h3>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Prev Payroll Name</th>
                  <th>New Payroll Name</th>
                </tr>
              </thead>
              <tbody>
                {selectedLog.old_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.username}</td>
                    <td>{record.email}</td>
                    <td>{record.old_name}</td>
                    <td>{record.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {isNewPresent && (
          <>
            <h3 style={{ marginTop: isOldPresent ? '30px' : '0px' }}>
              Newly Assigned Payroll Structure
            </h3>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Payroll Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>CTC</th>
                  <th>Conveyance Allowance</th>
                  <th>Effective From</th>
                  <th>Basic Formula</th>
                  <th>Description</th>
                  <th>HRA Formula</th>
                  <th>Conveyance Allowance Formula</th>
                  <th>Special Allowance Formula</th>
                </tr>
              </thead>
              <tbody>
                {selectedLog.new_records.map((record, index) => (
                  <tr key={index}>
                    <td>{record.name}</td>
                    <td>{record.username}</td>
                    <td>{record.email}</td>
                    <td>{record.ctc}</td>
                    <td>{record.conveyance_allowance}</td>
                    <td>
                      {new Date(record.effective_from).toLocaleDateString()}
                    </td>
                    <td>{record.basic_formula}</td>
                    <td>{record.description}</td>
                    <td>{record.hra_formula}</td>
                    <td>{record.conveyance_allowance_formula}</td>
                    <td>{record.special_allowance_formula}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {!isOldPresent && !isNewPresent && (
          <p style={{ textAlign: 'center' }}>No Records Found</p>
        )}
      </ModalBody>
    </Modal>
  );
};

export default AssignedPayrollStructure;
