import React from 'react';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';

const UpdatePayrollStructure = ({ selectedLog, toggleModal, modal }) => {
    console.log(selectedLog, "updatepayrollstrct");

    // Keys to exclude from both old and new data
    const keysToExclude = ['id', 'user_id', 'org_id', 'updated_at', 'updated_by'];

    // Filter the new data and sort keys
    const filteredData = Object.keys(selectedLog)
        .filter(key => !keysToExclude.includes(key) && key !== 'oldData')
        .sort();

    // Prepare the new data values sorted by filtered keys
    const newDataValues = filteredData.map(key => selectedLog[key]);

    // Filter the old data and sort keys
    const filteredOldData = selectedLog.oldData.map(item => {
        return Object.keys(item)
            .filter(key => !keysToExclude.includes(key))
            .sort()
            .reduce((acc, key) => {
                acc[key] = item[key];
                return acc;
            }, {});
    });

    console.log(filteredData, "Filtered New Data Keys");
    console.log(filteredOldData, "Filtered Old Data");

    return (
        <Modal isOpen={modal} toggle={toggleModal} size="xl" centered style={{ maxWidth: '90vw' }}>
            <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
            <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <Table>
                    <thead>
                        <tr>
                            {filteredData.map((key) => (
                                <th key={key}>{key.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Old Data Row */}
                        {filteredOldData.map((item, index) => (
                            <tr key={index}>
                                {filteredData.map((key, idx) => (
                                    <td key={idx} style={{ color: 'red' }}>{item[key]}</td>
                                ))}
                            </tr>
                        ))}
                        {/* New Data Row */}
                        <tr>
                            {newDataValues.map((value, index) => (
                                <td key={index} style={{ color: 'green' }}>{value}</td>
                            ))}
                        </tr>
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    );
};

export default UpdatePayrollStructure;
