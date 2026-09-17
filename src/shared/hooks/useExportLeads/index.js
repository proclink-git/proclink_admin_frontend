import { useCallback, useContext } from 'react'
import { useLazyQuery } from '@apollo/client'
import { useIntl } from 'react-intl'

import { EXPORT_LEADS } from 'graph-ql/csv/query'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

export const LEAD_EXPORT_TYPE = {
  INQUIRY: 'i',
  CONTACT: 'c',
  CHATBOT: 'cr'
}

export function downloadCsvFile({ sCsv, sContentType, sFileName }) {
  const blob = new Blob([sCsv], {
    type: sContentType || 'text/csv;charset=utf-8;'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = sFileName || 'leads.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildExportLeadsInput(eLeadType, filters = {}) {
  const input = { eLeadType }

  if (filters.eHeaderCategoryType) input.eHeaderCategoryType = filters.eHeaderCategoryType
  if (filters.aState !== undefined && filters.aState !== null && filters.aState !== '') {
    input.aState = Array.isArray(filters.aState) ? filters.aState : [filters.aState]
  }
  if (filters.sSearch) input.sSearch = filters.sSearch
  if (filters.sSortBy) input.sSortBy = filters.sSortBy
  if (filters.nOrder !== undefined && filters.nOrder !== null && filters.nOrder !== '') {
    input.nOrder = Number(filters.nOrder)
  }
  if (filters.dStartDate) input.dStartDate = filters.dStartDate
  if (filters.dEndDate) input.dEndDate = filters.dEndDate
  if (typeof filters.bMarketingOpt === 'boolean') input.bMarketingOpt = filters.bMarketingOpt

  return input
}

function useExportLeads() {
  const { dispatch } = useContext(ToastrContext)
  const intl = useIntl()
  const [exportLeads, { loading }] = useLazyQuery(EXPORT_LEADS, {
    fetchPolicy: 'network-only'
  })

  const showToast = useCallback(
    (message, type = TOAST_TYPE.Error) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message,
          type,
          btnTxt: intl.formatMessage({ id: 'close' })
        }
      })
    },
    [dispatch, intl]
  )

  const handleExport = useCallback(
    async (input) => {
      try {
        const { data, error } = await exportLeads({ variables: { input } })
        if (error) return

        const payload = data?.exportLeads
        const oData = payload?.oData

        if (!oData) {
          showToast(payload?.sMessage || intl.formatMessage({ id: 'somethingWentWrong' }))
          return
        }

        if (oData.nTotal === 0) {
          showToast(intl.formatMessage({ id: 'noRecordsToDownload' }))
          return
        }

        if (!oData.sCsv) {
          showToast(payload?.sMessage || intl.formatMessage({ id: 'somethingWentWrong' }))
          return
        }

        downloadCsvFile(oData)
      } catch (err) {
        showToast(err?.message || intl.formatMessage({ id: 'somethingWentWrong' }))
      }
    },
    [exportLeads, intl, showToast]
  )

  return { handleExport, loading }
}

export default useExportLeads
