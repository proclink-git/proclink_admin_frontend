import PropTypes from 'prop-types'
import React, { Suspense } from 'react'
import { Button, Form, Table } from 'react-bootstrap'
import Select from 'react-select'
import { FormattedMessage, useIntl } from 'react-intl'
import { useApolloClient } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'

import Search from '../search'
import { parseParams } from 'shared/utils'
import Loading from '../loading'
import { GET_USER_PERMISSION } from 'graph-ql/permission/query'
import PermissionProvider from '../permission-provider'
import CustomAlert from 'shared/components/alert'
import ToolTip from 'shared/components/tooltip'

const CustomPagination = React.lazy(() => import('shared/components/custom-pagination'))
function DataTable({
  children,
  bulkAction,
  component,
  columns,
  sortEvent,
  isLoading,
  totalRecord,
  pagination,
  header,
  headerEvent,
  checkbox,
  selectAllEvent,
  pageChangeEvent,
  selectAllValue,
  actionColumn,
  tabs,
  tabEvent,
  ...rest
}) {
  const params = parseParams(location.search)
  const client = useApolloClient()
  const { getUserPermissions } = client.readQuery({
    query: GET_USER_PERMISSION
  })
  const selectedRows = Number(params.nLimit) || pagination?.pageSize || 10
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    deleteMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' }),
    approvalMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToApproveAllItem' }),
    rejectedMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToRejectAllItem' }),
    readMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToReadAllItem' }),
    unreadMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToUnreadAllItem' })
  }

  const modalMessage = (action) => {
    if (action === 'r') {
      return labels.readMessage
    } else if (action === 'ur') {
      return labels.unreadMessage
    } else if (action === 'rj') {
      return labels.rejectedMessage
    } else if (action === 'ap') {
      return labels.approvalMessage
    } else {
      return labels.deleteMessage
    }
  }

  const handleBulkAction = (e) => {
    if (e.value === 'd' || e.value === 'r' || e.value === 'ur' || e.value === 'ap' || e.value === 'rj') {
      confirmAlert({
        title: labels.confirmationTitle,
        message: modalMessage(e.value),
        customUI: CustomAlert,
        buttons: [
          {
            label: labels.yes,
            onClick: async () => {
              headerEvent('bulkAction', e.value)
            }
          },
          {
            label: labels.no
          }
        ]
      })
    } else {
      headerEvent('bulkAction', e.value)
    }
  }
  return (
    <div className={`data-table ${rest.className}`}>
      {header && (
        <div className="data-table-header d-md-flex align-items-center justify-content-between">
          <div className="d-flex left">
            {header.left.bulkAction && (
              <Form.Group className="bulk-action only-border mb-0 form-group">
                <Select
                  options={bulkAction.filter((e) => {
                    if (typeof e.isAllowedTo === 'string' && getUserPermissions.includes(e.isAllowedTo)) return e
                    else if (Array.isArray(e.isAllowedTo) && e.isAllowedTo.some((permission) => getUserPermissions.includes(permission))) {
                      return e
                    } else if (!e.isAllowedTo) return e
                    else return null
                  })}
                  className="react-select only-border sm"
                  classNamePrefix="select"
                  isSearchable={false}
                  placeholder="Bulk Action"
                  isDisabled={!selectAllValue?.filter((e) => e.value).length}
                  onChange={(e) => {
                    handleBulkAction(e)
                  }}
                />
              </Form.Group>
            )}
            {header.left.rows && (
              <Form.Group className="bulk-action only-border form-group mb-0 d-flex align-items-center">
                <span>
                  <FormattedMessage id="rows" />
                </span>
                <Select
                  options={[10, 20, 30, 40, 50].map((e) => ({ label: e, value: e }))}
                  value={[{ label: selectedRows, value: selectedRows }]}
                  className="react-select only-border sm"
                  classNamePrefix="select"
                  isSearchable={false}
                  onChange={(e) => {
                    headerEvent('rows', e.value)
                  }}
                />
              </Form.Group>
            )}
          </div>
          <div className="right d-flex align-items-center">
            {header.right.search && <Search className="search-box only-border m-0" searchEvent={(e) => headerEvent('search', e)} />}
            {header.right.latestFirst && (
              <ToolTip toolTipMessage={<FormattedMessage id="latestFirst" />}>
                <Button variant="outline-secondary" className="square" size="sm" onClick={() => headerEvent('latestFirst', 1)}>
                  <FormattedMessage id="latestFirst" />
                  <i className="icon-sort" />
                </Button>
              </ToolTip>
            )}
            {header.right.filter && (
              <ToolTip toolTipMessage={<FormattedMessage id="filter" />}>
                <Button variant="info" className="square btn-filter" size="sm" onClick={() => headerEvent('filter', true)}>
                  <FormattedMessage id="filter" />
                  <i className="icon-filter-list" />
                  <div className="is-filtered-label">
                    <span></span>
                  </div>
                </Button>
              </ToolTip>
            )}
            {header.right.component && component}
          </div>
        </div>
      )}
      <ul className="data-table-tabs d-flex">
        {tabs &&
          tabs.map((item) => {
            if (item.isAllowedTo) {
              return (
                <PermissionProvider key={item.internalName} isAllowedTo={item.isAllowedTo}>
                  <li className={`${item.active ? 'active' : ''} ${item?.className}`} onClick={() => tabEvent(item.internalName)}>
                    {item.name} {item.count >= 0 && `(${item.count})`}
                  </li>
                </PermissionProvider>
              )
            } else {
              return (
                <li key={item.internalName} className={`${item.active ? 'active' : ''} ${item?.className}`} onClick={() => tabEvent(item.internalName)}>
                  {item.name} {item.count >= 0 && `(${item.count})`}
                </li>
              )
            }
          })}
      </ul>
      <Table className="table-borderless" responsive="sm">
        <thead>
          <tr>
            {checkbox && (
              <th className="checkbox">
                <Form.Check
                  type="checkbox"
                  id="All"
                  name="selectAll"
                  className="form-check m-0"
                  onChange={selectAllEvent}
                  checked={selectAllValue.length ? selectAllValue.every((item) => item.value) : false}
                  label="&nbsp;"
                />
              </th>
            )}
            {columns &&
              columns.map((column) => {
                return (
                  <th key={column.internalName}>
                    <span onClick={() => (typeof column.type === 'number' ? sortEvent(column) : null)}>
                      {column.name}
                      {column.type === 1 && <i className="icon-arrow-drop-up" />}
                      {column.type === -1 && <i className="icon-arrow-drop-down" />}
                    </span>
                  </th>
                )
              })}
            {actionColumn && <th className="text-end">{useIntl().formatMessage({ id: 'actions' })}</th>}
          </tr>
        </thead>
        <tbody>
          {children}
          {totalRecord === 0 && (
            <tr>
              <td colSpan={(columns?.length || 0) + (checkbox ? 2 : 1)} className="text-center">
                <FormattedMessage id="noRecordFound" />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {isLoading && <Loading />}
      {pagination && (
        <Suspense fallback={<div />}>
          <CustomPagination
            currentPage={pagination.currentPage}
            totalCount={totalRecord}
            pageSize={pagination.pageSize}
            onPageChange={pageChangeEvent}
          />
        </Suspense>
      )}
    </div>
  )
}
DataTable.propTypes = {
  children: PropTypes.node,
  bulkAction: PropTypes.array,
  columns: PropTypes.array,
  sortEvent: PropTypes.func,
  isLoading: PropTypes.bool,
  pagination: PropTypes.object,
  totalRecord: PropTypes.number,
  header: PropTypes.object,
  headerEvent: PropTypes.func,
  selectAllEvent: PropTypes.func,
  pageChangeEvent: PropTypes.func,
  checkbox: PropTypes.bool,
  selectAllValue: PropTypes.array,
  actionColumn: PropTypes.bool,
  tabs: PropTypes.array,
  tabEvent: PropTypes.func,
  component: PropTypes.object
  // tabCount: PropTypes.number
}
export default DataTable
