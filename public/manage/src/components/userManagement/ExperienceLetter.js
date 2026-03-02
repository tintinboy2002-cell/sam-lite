import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
 
const ExperienceLetter = ({ name, employeeId, department, designation, lastWorkingDay, dateOfJoining, Address, companyName, logo }) => {
  const topColor = '#000000'; // Set to black color
  const bottomColor = '#000000'; // Set to black color
 
  const generatePDF = () => {
    const input = document.getElementById('experience-letter');
    const scaleFactor = 2; // Increase the scale factor for higher resolution
    html2canvas(input, { scale: scaleFactor }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Set PDF to A4 size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
 
      let position = 0;
 
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
 
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
 
      pdf.save(`${name}_Experience_Letter.pdf`);
    });
  };
 
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
 
  const today = new Date().toLocaleDateString(); // Get today's date
 
  return (
    <React.Fragment>
      <div
        id="experience-letter"
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          width: '100%', // Full width
          maxWidth: '210mm', // Limit width to A4
          margin: '0 auto', // Center the content
          boxSizing: 'border-box', // Include padding in width
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <img src={logo} alt="Company Logo" style={{ maxWidth: '120px', width: '100%' }} />
        </div>
 
        {/* <div style={{ backgroundColor: topColor, height: '10px', width: '100%', marginTop: '20px' }}></div> */}
        
        <h1 style={{ textAlign: 'center', color: '#333', fontSize: '24px', margin: '20px 0' }}>Experience Letter</h1>
        
        <p style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6', margin: '20px 20px', marginBottom: '20px' , marginTop:'70px' }}>
          <strong>{today}</strong><br/>
          Employee ID: <strong>{employeeId}</strong><br/>
        </p>
        
        <div style={{marginTop:'50px'}}>
        <p style={{ textAlign: 'justify', fontSize: '14px', lineHeight: '1.6', margin: '0 20px', marginBottom: '20px' }}>
          This is to certify that <strong>{name}</strong> has been employed with Nubax Datalabs from <strong>{formatDate(dateOfJoining)}</strong> to  <strong> {lastWorkingDay}</strong>. During their tenure, they have worked as a {designation}.
        </p>
        
        <p style={{ textAlign: 'justify', fontSize: '14px', lineHeight: '1.6', margin: '0 20px', marginBottom: '20px' }}>
          Throughout their time with us, {name} demonstrated exceptional skills in their field, significantly enhancing our team's performance and project outcomes.
        </p>
        
        <p style={{ textAlign: 'justify', fontSize: '14px', lineHeight: '1.6', margin: '0 20px', marginBottom: '20px' }}>
          Their conduct and performance during their tenure at Nubax Datalabs were excellent, and I wish them success in their future endeavors.
        </p>
        </div>
        
        <p style={{ textAlign: 'left', marginTop: '30px', fontSize: '14px', margin: '0 20px' }}>From Nubax Datalabs</p>
        
        <p style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6', margin: '20px 20px', marginTop: '330px' }}>
          <strong>{companyName}</strong><br/>
          {Address},<br/>
        </p>
 
        {/* <div style={{ backgroundColor: bottomColor, height: '10px', width: '100%', marginTop: '10px' }}></div> */}
      </div>
      
      <button onClick={generatePDF} style={{ display: 'block', margin: '20px auto', padding: '10px 20px', backgroundColor: '#6BC2AA', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Download PDF
      </button>
    </React.Fragment>
  );
};
 
export default ExperienceLetter;