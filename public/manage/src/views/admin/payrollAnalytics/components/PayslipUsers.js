import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Input,
  Modal,
  Empty,
  Row,
  Col,
  Divider,
  Tooltip,
} from 'antd';
import httpInjectorService from 'services/http-injector.service';
import { toast } from 'react-toastify';
import numberToWords from 'number-to-words';
import { set } from 'lodash';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { CardBody, Label } from 'reactstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TableContainer from 'components/common/TableContainer';
import pdfMake from 'pdfmake/build/pdfmake';
import "pdfmake/build/vfs_fonts";
import nubaxLogo from '../../../../assets/img/nubaxlogo.png';










const PayslipUsers = ({ usersData, month, year }) => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState([]);
  const [show, setShow] = useState(false);
  const payslipRef = useRef(null);
  const [viewUserId, setViewUserId] = useState(null);


const convertImageToBase64 = async (imgPath) => {
  const response = await fetch(imgPath);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // base64 string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

  

 const generatePayslipPDF = async (payslip) => {
  const logoBase64 = await convertImageToBase64(nubaxLogo);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        image: logoBase64,
        width: 100,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },
      {
        text: displayValue(payslip.company_name),
        style: 'header',
        alignment: 'center',
        margin: [0, 10],
      },
      {
        text: displayValue(payslip.registered_office || payslip.corporate_office),
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      },
      {
        text: `Payslip for the Month of ${displayValue(payslip.month)}, ${displayValue(payslip.year)}`,
        style: 'sectionTitle',
        alignment: 'center',
        margin: [0, 10],
      },

      // Employee Info + Bank Details Box with Vertical Divider
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [{ text: 'Employee Info', colSpan: 2, style: 'tableHeader' }, {}],
                        ['Name', displayValue(payslip.employee_name)],
                        ['Designation', displayValue(payslip.designations)],
                        ['Department', displayValue(payslip.department_name)],
                        ['Location', displayValue(payslip.work_location)],
                        ['LOP', displayValue(payslip.lop)],
                      ],
                    },
                    layout: {
                      hLineWidth: (i) => (i === 1 ? 1 : 0),
                      vLineWidth: () => 0,
                      paddingLeft: () => 8,
                      paddingRight: () => 8,
                      paddingTop: () => 4,
                      paddingBottom: () => 4,
                    },
                  },
                ],
              },
              {
                stack: [
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [{ text: 'Bank Details', colSpan: 2, style: 'tableHeader' }, {}],
                        ['Employee ID', displayValue(payslip.employee_id)],
                        ['Bank Name', displayValue(payslip.bank_name)],
                        ['Account No', displayValue(payslip.account_number)],
                        ['PAN No', displayValue(payslip.pan_no)],
                      ],
                    },
                    layout: {
                      hLineWidth: (i) => (i === 1 ? 1 : 0),
                      vLineWidth: () => 0,
                      paddingLeft: () => 8,
                      paddingRight: () => 8,
                      paddingTop: () => 4,
                      paddingBottom: () => 4,
                    },
                  },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1, // vertical divider between columns
          hLineColor: () => '#ccc',
          vLineColor: () => '#ccc',
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 10],
      },

      // Earnings + Deductions Box with Totals and Vertical Divider
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              {
                stack: [
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [{ text: 'Earnings', colSpan: 2, style: 'tableHeader' }, {}],
                        ['Basic', formatCurrency(payslip.basic_month)],
                        ['HRA', formatCurrency(payslip.hra_month)],
                        ['Conveyance Allowance', formatCurrency(payslip.conveyance_allowance_month)],
                        ['Special Allowance', formatCurrency(payslip.special_allowance_month)],
                        ['Variable', formatCurrency(payslip.variable)],
                      ],
                    },
                    layout: {
                      hLineWidth: (i) => (i === 1 ? 1 : 0),
                      vLineWidth: () => 0,
                      paddingLeft: () => 8,
                      paddingRight: () => 8,
                      paddingTop: () => 4,
                      paddingBottom: () => 4,
                    },
                  },
                ],
              },
              {
                stack: [
                  {
                    table: {
                      widths: ['60%', '40%'],
                      body: [
                        [{ text: 'Deductions', colSpan: 2, style: 'tableHeader' }, {}],
                        ['Adoc', formatCurrency(payslip.adoc_deduction)],
                      ],
                    },
                    layout: {
                      hLineWidth: (i) => (i === 1 ? 1 : 0),
                      vLineWidth: () => 0,
                      paddingLeft: () => 8,
                      paddingRight: () => 8,
                      paddingTop: () => 4,
                      paddingBottom: () => 4,
                    },
                  },
                ],
              },
            ],
            [
              {
                colSpan: 2,
                columns: [
                  {
                    width: '50%',
                    columns: [
                      {
                        text: 'Total Earnings (₹):',
                        bold: true,
                        margin: [8, 5, 0, 5],
                      },
                      {
                        text: formatCurrency(payslip.ctc_per_month),
                        bold: true,
                       alignment: 'center',
                        margin: [0, 5, 8, 5],
                      },
                    ],
                  },
                  {
                    width: '50%',
                    columns: [
                      {
                        text: 'Total Deductions (₹):',
                        bold: true,
                        margin: [8, 5, 0, 5],
                      },
                      {
                        text: formatCurrency(payslip.adoc_deduction),
                        bold: true,
                        alignment: 'center',
                        margin: [0, 5, 8, 5],
                      },
                    ],
                  },
                ],
              },
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1, // vertical divider between columns
          hLineColor: () => '#ccc',
          vLineColor: () => '#ccc',
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 10],
      },

      // Net Pay & Amount in Words
      {
        text: `Net Pay For The Month: ${formatCurrency(payslip.net_pay)}`,
        margin: [0, 10],
        bold: true,
      },
      {
        text: `Rupees ${
          payslip.net_pay && !isNaN(Number(payslip.net_pay))
            ? numberToWords.toWords(Number(payslip.net_pay))
            : 'Zero'
        } Only`,
        italics: true,
        margin: [0, 5],
      },
      {
        text: 'This is a system-generated payslip and does not require a signature.',
        alignment: 'center',
        margin: [0, 20],
        fontSize: 10,
      },
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      subheader: { fontSize: 12 },
      sectionTitle: { fontSize: 13, bold: true, margin: [0, 5] },
      tableHeader: { fontSize: 12, bold: true, margin: [0, 5] },
    },
  };

  pdfMake.createPdf(docDefinition).download(
    `Payslip_${displayValue(payslip.employee_id, 'Unknown')}.pdf`
  );
};





  const filteredData = useMemo(() => {
    return usersData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.designation_name
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        user.department_name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [usersData, searchText]);

  const handleView = async (userId) => {
    const reqBody = {
      month,
      year,
      users: userId,
    };
    
    setViewUserId(userId);
    console.log(month, year, userId, 'month and year');

    try {
      const response = await httpInjectorService.viewPayslipDetails(reqBody);

      if (response.status === 'success') {
        setSelectedPayslip(response.data);
        setShow(true);
        setIsModalVisible(true);
      } else {
        toast.error(response?.message || 'Failed to fetch payslip details.', {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error('Error fetching payslip details:', err);
      toast.error('Something went wrong while fetching payslip.', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const displayValue = (value, fallback = '—') => {
    return value !== null && value !== undefined && value !== ''
      ? value
      : fallback;
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPayslip(null);
    setViewUserId(null);
    setShow(false);
  };

  const formatCurrency = (value) =>
    value && !isNaN(value) ? `₹${Number(value).toFixed(2)}` : '₹0.00';

  const downloadPDF = async () => {
    if (!payslipRef.current) {
      console.error('Payslip reference is null');
      return;
    }

    try {
      const tables = payslipRef.current.querySelectorAll('table');
      tables.forEach((table) => {
        table.style.border = '1px solid black';
        table.style.borderCollapse = 'collapse';
        table.querySelectorAll('th, td').forEach((cell) => {
          cell.style.border = '1px solid black';
          cell.style.color = 'black';
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(payslipRef.current, {
        scale: 3,
        backgroundColor: '#fff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('payslip.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // const handleDownloadFromTable = async (userId) => {
  //   const reqBody = { month, year, users: userId };

  //   try {
  //     const response = await httpInjectorService.viewPayslipDetails(reqBody);

  //     if (response.status === 'success') {
  //       setSelectedPayslip(response.data);
  //       setShow(true);
  //       setIsModalVisible(true);

  //       // Wait for modal to render before capturing
  //       setTimeout(async () => {
  //         await downloadPDF(); // Capture modal content
  //         handleCloseModal(); // Close modal after download
  //       }, 300); // Slightly increased delay for DOM stability
  //     } else {
  //       toast.error(response?.message || 'Failed to fetch payslip details.', {
  //         position: 'top-right',
  //         autoClose: 2000,
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Error fetching payslip details:', err);
  //     toast.error('Something went wrong while fetching payslip.', {
  //       position: 'top-right',
  //       autoClose: 2000,
  //     });
  //   }
  // };

  const handleDownloadFromTable = async (userId) => {
    const reqBody = { month, year, users: [userId] };

    try {
      const response = await httpInjectorService.viewPayslipDetails(reqBody);

      if (response.status === 'success') {
        const payslip = Array.isArray(response.data) ? response.data[0] : null;
        console.log(payslip, "response data");
        if (payslip) {
          generatePayslipPDF(payslip);
        } else {
          toast.error('Payslip data is empty.', { position: 'top-right', autoClose: 2000 });
        }
      } else {
        toast.error(response?.message || 'Failed to fetch payslip details.', { position: 'top-right', autoClose: 2000 });
      }
    } catch (err) {
      console.error('Error fetching payslip details:', err);
      toast.error('Something went wrong while fetching payslip.', { position: 'top-right', autoClose: 2000 });
    }
  };

  const renderPayslipModal = () => {
    if (!show) return null;

    const payslip = selectedPayslip[0];
    
    return (
      <Modal
        // title={`Payslip for ${displayValue(payslip.employee_name, 'Employee')}`}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={720} // Reduced from 1000 to better fit A4
        style={{ top: 5, zIndex: '-1' }} // Adjusted for better vertical centering
      >
        <div ref={payslipRef} className="bg-white rounded-xl p-4">
          {/* Logo and Header */}
      
            <img
              src={nubaxLogo}
              height="100px"
              width="100px"
              alt="Company Logo"
              style={{ display: 'block', margin: '0 auto' }}
            />

          <h2 className="text-center fw-bold mt-2">
            {displayValue(payslip.company_name)}
          </h2>
          <p className="text-center mb-0">
            {displayValue(payslip.registered_office) ||
              displayValue(payslip.corporate_office)}
          </p>
          <h4 className="text-center mt-3">
            Payslip for the Month of {displayValue(payslip.month)},{' '}
            {displayValue(payslip.year)}
          </h4>

          <Divider />

          {/* Employee Info Section */}
          <div
            style={{
              display: 'flex',
              border: '1px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div style={{ flex: 1, padding: '16px' }}>
              {[
                ['Name', payslip.employee_name],
                ['Designation', payslip.designations],
                ['Department', payslip.department_name],
                ['Location', payslip.work_location],
                ['LOP', payslip.lop],
              ].map(([label, value], i) => (
                <Row className="mb-2" key={i}>
                  <Col span={8}>{label}:</Col>
                  <Col span={16}>{displayValue(value)}</Col>
                </Row>
              ))}
            </div>
            <div style={{ width: '1px', backgroundColor: '#ccc' }} />
            <div style={{ flex: 1, padding: '16px' }}>
              {[
                ['Employee ID', payslip.employee_id],
                ['Bank Name', payslip.bank_name],
                ['Bank Account No', payslip.account_number],
                ['PAN No', payslip.pan_no],
              ].map(([label, value], i) => (
                <Row className="mb-2" key={i}>
                  <Col span={8}>{label}:</Col>
                  <Col span={16}>{displayValue(value)}</Col>
                </Row>
              ))}
            </div>
          </div>

          <Divider />

          {/* Earnings & Deductions Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex' }}>
              {/* Earnings */}
              <div style={{ flex: 1, padding: '16px' }}>
                <h6 className="mb-1" style={{ fontWeight: 'bold' }}>
                  Earnings
                </h6>
                <Divider />
                {[
                  // removed divider here
                  ['Basic', payslip.basic_month],
                  ['HRA', payslip.hra_month],
                  ['Conveyance Allowance', payslip.conveyance_allowance_month],
                  ['Special Allowance', payslip.special_allowance_month],
                  ['Variable', payslip.variable],
                ].map(([label, value], i) => (
                  <Row className="mb-2" key={i}>
                    <Col span={12}>{label}</Col>
                    <Col span={12}>{formatCurrency(value)}</Col>
                  </Row>
                ))}
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', backgroundColor: '#ccc' }} />

              {/* Deductions */}
              <div style={{ flex: 1, padding: '16px' }}>
                <h6 className="mb-1" style={{ fontWeight: 'bold' }}>
                  Deductions
                </h6>
                <Divider />
                {/* removed divider here */}
                <Row className="mb-2">
                  <Col span={12}>Adoc</Col>
                  <Col span={12}>{formatCurrency(payslip.adoc_deduction)}</Col>
                </Row>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div
              style={{
                height: '1px',
                backgroundColor: '#ccc',
                margin: '0 16px',
              }}
            />

            {/* Totals */}
            <div style={{ padding: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Row>
                    <Col span={12} className="fw-bold">
                      Total Earnings (₹)
                    </Col>
                    <Col span={12}>{formatCurrency(payslip.ctc_per_month)}</Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row>
                    <Col span={12} className="fw-bold">
                      Total Deductions (₹)
                    </Col>
                    <Col span={12}>
                      {formatCurrency(payslip.adoc_deduction)}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>

          {/* Net Pay & Amount in Words */}
          <div style={{ marginBottom: '20px' }}>
            <Row className="mb-1">
              <Col span={6} className="fw-bold">
                Net Pay For The Month
              </Col>
              <Col span={10}>{formatCurrency(payslip.net_pay)}</Col>
            </Row>
            <Row>
              <Col span={24}>
                <span>
                  Rupees{' '}
                  {payslip.net_pay && !isNaN(payslip.net_pay)
                    ? numberToWords.toWords(Number(payslip.net_pay))
                    : 'Zero'}{' '}
                  Only
                </span>
              </Col>
            </Row>
          </div>

          <Divider />
          <div className="text-center">
            <span>
              This is a system-generated payslip and does not require a
              signature.
            </span>
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '20px' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
           onClick={() => {
  console.log('Generating payslip for user:', viewUserId);
  handleDownloadFromTable(viewUserId);
}}
            className="download-button"
          >
            Download PDF
          </Button>
        </div>
      </Modal>
    );
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        Header: 'Sl. No',
        accessor: 'slno',
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Designation',
        accessor: 'designation_name',
      },
      {
        Header: 'Department',
        accessor: 'department_name',
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <Space>
            <Tooltip title="View">
              <Button
                type="link"
                icon={
                  <span style={{ fontSize: '18px' }}>
                    <EyeOutlined />
                  </span>
                }
                onClick={() => handleView(row.original.user_id)}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                type="link"
                icon={
                  <span style={{ fontSize: '18px' }}>
                    <DownloadOutlined />
                  </span>
                }
                onClick={() => handleDownloadFromTable(row.original.user_id)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];
    return baseColumns;
  }, [usersData]);

  return (
    <Card bordered={false}>
      <TableContainer
        columns={columns}
        data={filteredData}
        isGlobalFilter={true}
        customPageSize={10}
        className="custom-header-css"
      />
      {renderPayslipModal()}
    </Card>
  );
};

export default PayslipUsers;
