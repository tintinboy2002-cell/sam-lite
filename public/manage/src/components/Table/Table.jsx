import React from 'react'
import { Table as CTable, Thead, Tbody, Tr, Th, Td, IconButton, Tooltip, Box } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

// Reusable table component
// Props:
// - data: array of row objects (alias: contacts for backward compatibility)
// - columns: [{ header: string, accessor?: string | ((row) => any), cell?: (value, row) => ReactNode }]
// - getRowKey?: (row, index) => string
// - renderActions?: (row) => ReactNode
// - onEdit?: (row) => void (alias: handleEdit)
// - onDelete?: (row) => void (alias: handleDeleteModal)
// - emptyMessage?: string
// - size, variant: Chakra UI Table props
const Table = ({
  data,
  contacts = [],
  columns,
  getRowKey,
  renderActions,
  onEdit,
  onDelete,
  handleEdit,
  handleCloseModal,
  emptyMessage = 'No records available.',
  size = 'md',
  variant = 'simple',
  ...tableProps
}) => {
  const rows = Array.isArray(data) ? data : Array.isArray(contacts) ? contacts : [];
  const editHandler = onEdit || handleEdit;
  const deleteHandler = onDelete || handleCloseModal;

  // default columns if none provided
  const resolvedColumns = Array.isArray(columns) && columns.length > 0
    ? columns
    : [
        { header: 'Full Name', accessor: (r) => r.full_name },
        { header: 'Relationship', accessor: (r) => r.relationship_with_employee },
        { header: 'Primary Contact', accessor: (r) => r.primary_contact_number },
        { header: 'Priority', accessor: (r) => r.priority_level },
      ];

  const renderCell = (col, row) => {
    if (typeof col.cell === 'function') return col.cell(row);
    if (typeof col.accessor === 'function') return col.accessor(row);
    if (typeof col.accessor === 'string') return row?.[col.accessor];
    return null;
  };

  const getKey = (row, index) => {
    if (typeof getRowKey === 'function') return getRowKey(row, index);
    return row?.pri_contact_id ?? row?.id ?? String(index);
  };

  return (
    <>
      <Box
        overflowX={{ base: 'auto', md: 'visible' }}
        overflowY="hidden"
        width="100%"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
        }}
        sx={{
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <CTable
          variant={variant}
          size={size}
          style={{
            borderCollapse: 'collapse',
            minWidth: '600px',
            width: '100%',
          }}
          {...tableProps}
        >
          <Thead>
            <Tr>
              {resolvedColumns.map((col, idx) => (
                <Th key={idx} textAlign="center" border="1px solid" borderColor="gray.300">
                  {col.header}
                </Th>
              ))}
              {(renderActions || editHandler || deleteHandler) && (
                <Th textAlign="center" border="1px solid" borderColor="gray.300">Actions</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {Array.isArray(rows) && rows.length > 0 ? (
              rows.map((row, idx) => (
                <Tr key={getKey(row, idx)} border="1px solid" borderColor="gray.300">
                  {resolvedColumns.map((col, cidx) => (
                    <Td key={cidx} textAlign="center">{renderCell(col, row)}</Td>
                  ))}
                  {(renderActions || editHandler || deleteHandler) && (
                    <Td textAlign="center" display="flex" justifyContent="center">
                      {typeof renderActions === 'function' ? (
                        renderActions(row)
                      ) : (
                        <>
                          {editHandler && (
                            <Tooltip label="Edit">
                              <IconButton
                                icon={<EditIcon />}
                                aria-label="Edit"
                                colorScheme="yellow"
                                size="sm"
                                onClick={() => editHandler(row)}
                              />
                            </Tooltip>
                          )}
                          {deleteHandler && (
                            <Tooltip label="Delete">
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Delete"
                                colorScheme="red"
                                size="sm"
                                ml={2}
                                onClick={() => deleteHandler(row)}
                              />
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Td>
                  )}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={(resolvedColumns.length + ((renderActions || editHandler || deleteHandler) ? 1 : 0)).toString()} textAlign="center" border="1px solid" borderColor="gray.300">
                  {emptyMessage}
                </Td>
              </Tr>
            )}
          </Tbody>
        </CTable>
      </Box>
    </>
  )
}

export default Table