import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
} from "reactstrap";

const UpdateAdocVariable = ({ selectedData, toggleModal, modal }) => {
  console.log(selectedData, "update adoc log");

  // Exclude keys like "oldData" and "id"
  const excludeKey = ["oldData", "id" ,"user_id", "username", "email"];
  const filteredData = Object.keys(selectedData).reduce((acc, key) => {
    if (!excludeKey.includes(key)) {
      acc[key] = selectedData[key];
    }
    return acc;
  }, {});

  // Extract oldData (assuming there's one object in oldData)
  const oldData = selectedData.oldData[0]; // Use the first object in oldData

  // Combine keys for the table header
  const combinedKeys = [...new Set([...Object.keys(oldData), ...Object.keys(filteredData)])];

  console.log(combinedKeys, " combinedKeys");
  // Create rows for old data (red text) and new data (green text)
  const oldDataRow = combinedKeys.map((key) => oldData[key] || "");
  const newDataRow = combinedKeys.map((key) => filteredData[key] || "");

  return (
    <Modal
      isOpen={modal}
      toggle={toggleModal}
      size="xl"
      centered
      style={{ maxWidth: "50vw" }}
    >
      <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
      <ModalBody style={{ maxHeight: "80vh", overflowY: "auto" }}>
           <span><strong>username:</strong></span> <span>{selectedData.username}</span>
                <span>{"  "}</span>
                <span style={{marginLeft:'40px'}}><strong>email:</strong></span> <span> {selectedData.email}</span>
               
                <Table style={{marginTop:'20px'}}></Table>
        <Table>
          <thead>
            <tr>
              {combinedKeys.map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Old Data Row in Red */}
            <tr >
              {oldDataRow.map((value, index) => (
                <td key={index} style={{ color: "red" }}>{value}</td>
              ))}
            </tr>
            {/* New Data Row in Green */}
            <tr >
              {newDataRow.map((value, index) => (
                <td key={index} style={{ color: "green" }}>{value}</td>
              ))}
            </tr>
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export default UpdateAdocVariable;
