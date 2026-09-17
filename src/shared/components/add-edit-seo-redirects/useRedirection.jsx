import { useMutation } from '@apollo/client'
import { ADD_SEO_REDIRECT } from 'graph-ql/settings/seo-redirects'
import { useContext } from 'react'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from '../toastr'

const useRedirection = () => {
  const { dispatch } = useContext(ToastrContext)

  const [addMutation, { loading, data }] = useMutation(ADD_SEO_REDIRECT, {
    onCompleted: (data) => {
      if (data && data.addSeoRedirect) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addSeoRedirect.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function addRedirection(eCode, sNewUrl, sOldUrl) {
    return addMutation({ variables: { input: { oInput: { eCode, sNewUrl, sOldUrl } } } })
  }
  return {
    data,
    loading,
    addRedirection
  }
}

export default useRedirection
