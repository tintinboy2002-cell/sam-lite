import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
} from 'react-table';
import { Table, Row, Col, Button, Input } from 'reactstrap';
import { Filter, DefaultColumnFilter } from './Filter';
import { Field } from 'formik';
import { TimeInput } from '@nextui-org/date-input';

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <Col sm={4}>
      <div className="search-box me-2 mb-2 d-inline-block">
        <div className="position-relative">
          <label htmlFor="search-bar-0" className="search-label">
            {/* <span id="search-bar-0-label" className="sr-only">
              Search this table
            </span> */}
            <input
              onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
              }}
              id="search-bar-0"
              type="text"
              className="form-control"
              placeholder={`${count} records...`}
              value={value || ''}
            />
          </label>
          <i className="bx bx-search-alt search-icon"></i>
        </div>
      </div>
    </Col>
  );
}

const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  customPageSize,
  className,
  customPageSizeOptions,
  isEditFilter,
  setEmployees,
  updateUser,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
        sortBy: [
          {
            desc: true,
          },
        ],
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
  );

  const [editableRowIndex, setEditableRowIndex] = useState(null);
  const [rowEdits, setRowEdits] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const generateSortingIndicator = (column) => {
    return column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : '';
  };

  const onChangeInSelect = (event) => {
    setPageSize(Number(event.target.value));
  };

  const onChangeInInput = (event) => {
    const page = event.target.value ? Number(event.target.value) - 1 : 0;
    gotoPage(page);
  };

  const handleRowDoubleClick = (rowIndex, row) => {
    setEditableRowIndex(rowIndex);
    setRowEdits({ ...row.original });
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const updatedRow = { ...data[editableRowIndex], ...rowEdits };
    const updatedData = data.map((row, index) =>
      index === editableRowIndex ? updatedRow : row
    );
    setEmployees(updatedData);
     
    // Send only the updated row to the API
    await updateUser({ employee: updatedRow });
  
    setEditableRowIndex(null);
    setRowEdits({});
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
    setEditableRowIndex(null);
    setRowEdits({});
    setIsEditing(false);
  };

  const handleInputChange = (key, value) => {
    setRowEdits((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Fragment>
      <Row className="mb-2">
        <Col md={customPageSizeOptions ? 2 : 1}>
          <select
            className="form-select"
            value={pageSize}
            onChange={onChangeInSelect}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </Col>
        {isGlobalFilter && (
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
        {isEditFilter && isEditing && (
          <Col className="text-end">
            <Button color="success" className="me-2" onClick={handleSaveClick}>
              Save
            </Button>
            <Button color="secondary" onClick={handleCancelClick}>
              Cancel
            </Button>
          </Col>
        )}
      </Row>

      <div className="table-responsive react-table">
        <Table bordered hover {...getTableProps()} className={className}>
          <thead
            className="table-nowrap"
            style={{ backgroundColor: '#d63384', color: 'white' }}
          >
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id}>
                    <div className="mb-2" {...column.getSortByToggleProps()}>
                      {column.render('Header')}
                      {generateSortingIndicator(column)}
                    </div>
                    {/* <Filter column={column} /> */}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map((row, rowIndex) => {
              prepareRow(row);
              const isRowEditing = editableRowIndex === rowIndex;

              return (
                <Fragment key={row.getRowProps().key}>
                  <tr
                    onDoubleClick={() => handleRowDoubleClick(rowIndex, row)}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.cells.map((cell) => (
                      <td key={cell.id} {...cell.getCellProps()}>
                        {isEditFilter &&
                        isRowEditing &&
                        (cell.column.id === 'formattedClockIn' ||
                          cell.column.id === 'formattedClockOut') ? (
                          
                          <input
                            type="time"
                            value={rowEdits[cell.column.id] || ''}
                            onChange={(e) =>
                              handleInputChange(cell.column.id, e.target.value)
                            }
                            className="form-control"
                          />
                        ) : (
                          cell.render('Cell') // Render the cell normally if it's not editable
                        )}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Row className="justify-content-md-end justify-content-center align-items-center">
        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button
              color="primary"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              {'<<'}
            </Button>
            <Button
              color="primary"
              onClick={previousPage}
              disabled={!canPreviousPage}
            >
              {'<'}
            </Button>
          </div>
        </Col>
        <Col className="col-md-auto d-none d-md-block">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </Col>
        <Col className="col-md-auto">
          <Input
            type="number"
            min={1}
            style={{ width: 70 }}
            max={pageOptions.length}
            defaultValue={pageIndex + 1}
            onChange={onChangeInInput}
          />
        </Col>

        <Col className="col-md-auto">
          <div className="d-flex gap-1">
            <Button color="primary" onClick={nextPage} disabled={!canNextPage}>
              {'>'}
            </Button>
            <Button
              color="primary"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              {'>>'}
            </Button>
          </div>
        </Col>
      </Row>
    </Fragment>
  );
};

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default TableContainer;
