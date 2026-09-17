import { useState } from 'react'
import { useMutation } from '@apollo/client'

import { ADD_SEO, UPDATE_SEO } from 'graph-ql/add-update-seo/mutation'
import { META_ROBOTS } from 'shared/constants'
import UpdateCache from 'shared/components/cache/updateCache'

function SeoMutation() {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const [cacheVars, setCacheVars] = useState()
  const { updateCacheData } = UpdateCache()

  const [addSeo] = useMutation(ADD_SEO, {
    onCompleted: (data) => {
      setData(data?.insertSeo?.oData)
      setLoading(false)
    },
    onError: (data) => {
      setLoading(false)
    },
    update: (cache, { data }) => {
      if (cacheVars && data && data?.insertSeo && data?.insertSeo?.oData) {
        updateCacheData(cacheVars.query, cacheVars.variable, { seo: data.insertSeo.oData }, cacheVars.getKeyName)
        setCacheVars()
      }
    }
  })

  const [updateSeo] = useMutation(UPDATE_SEO, {
    onCompleted: (data) => {
      setData(data?.editSeo?.oData)
      setLoading(false)
    },
    onError: (data) => {
      setLoading(false)
    },
    update: (cache, { data }) => {
      if (cacheVars && data && data?.editSeo && data?.editSeo?.oData) {
        updateCacheData(cacheVars.query, cacheVars.variable, { seo: data.editSeo.oData }, cacheVars.getKeyName)
        setCacheVars()
      }
    }
  })

  async function uploadData(formData, type, id, isEdit, cacheParams) {
    // IF images are selected
    setData()
    cacheParams && setCacheVars(cacheParams)
    setLoading(true)
    addUpdateSeo(
      {
        ...formData,
        eType: type,
        iId: id
      },
      isEdit
    )
  }

  function addUpdateSeo(value, isEdit) {
    const data = { ...value, oFB: { ...value.oFB }, oTwitter: { ...value.oTwitter } }
    data.aKeywords = data.aKeywords ? data.aKeywords.split(',').map((w) => w.trim()) : []
    if (!data.sRobots) data.sRobots = META_ROBOTS[0]
    delete data.fb
    delete data.twitter
    delete data.oFB.fSUrl
    delete data.oTwitter.fSUrl
    isEdit ? updateSeo({ variables: { input: data } }) : addSeo({ variables: { input: data } })
  }

  return { data, uploadData, loading }
}
export default SeoMutation
