import React from "react"
import {
  Modal,
  ModalHeader,
  ModalBody,
  Table,
} from "reactstrap";
 
const UpdatePayoutDetails = ({ selectedLog, toggleModal, modal }) => {
  console.log(selectedLog, "selllog");
 
  return (
    <Modal
         isOpen={modal}
         toggle={toggleModal}
         size="xl"
         centered
         style={{ maxWidth: '50vw' }}
       >
         <ModalHeader toggle={toggleModal}>Log Details</ModalHeader>
         <ModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
           <h5 style={{marginBottom:'20px'}}>Update Payout Details</h5>
           <span><strong>Username:</strong></span> <span>{selectedLog[0].name}</span>
           <span>{"  "}</span>
           <span style={{marginLeft:'40px'}}><strong>Email:</strong></span> <span> {selectedLog[0].email}</span>
          
          <Table style={{marginTop:'20px'}}>
            <thead>
              <tr>
                <th>Data type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>prev data</td>
               
                <td style={{color:"red"}}>{selectedLog[0].old_status}</td>
              </tr>
              <tr> 
                <td>new data</td>
                 <td style={{color:"green"}}>{selectedLog[0].new_status}</td>
                </tr>
            </tbody>
            </Table>
 
         </ModalBody>
       </Modal>
  )
}
 
export default UpdatePayoutDetails