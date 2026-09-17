import { useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { debounce } from 'shared/utils'

const useReactSelect = ({ selectedItem, requestParams, query, responceCallBack, skip = false }) => {
  const isBottomReached = useRef(false)
  const totalRecords = useRef(0)
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(selectedItem)
  const [payload, setPayload] = useState(requestParams)

  const { loading } = useQuery(query, {
    variables: { input: payload },
    skip,
    onCompleted: (data) => {
      responceCallBack(data)
      // totalRecords.current = data?.listPoll?.aPolls.nTotal
      // if (data?.listPoll?.aPolls.length && isBottomReached.current) {
      //   setPoll([...poll, ...data?.listPoll?.aPolls])
      //   isBottomReached.current = false
      // } else if (data?.listPoll?.aPolls?.length) {
      //   setPoll(data?.listPoll?.aPolls)
      // }
    }
  })

  function onApiResponce(data) {
    totalRecords.current = data?.length
    if (data?.length && isBottomReached.current) {
      setItems([...items, ...data])
      isBottomReached.current = false
    } else if (data?.length) {
      setItems(data)
    }
  }

  function handleScroll(e) {
    if (totalRecords.current === payload.nLimit) {
      isBottomReached.current = true
      setPayload({
        ...payload,
        nSkip: payload.nSkip + 1
      })
    }
  }

  const handleSearch = debounce((txt, { action }) => {
    if (action === 'input-change') {
      setPayload({ ...payload, nSkip: 1, sSearch: txt })
    }
    if (action === 'menu-close') {
      setPayload({ ...payload, nSkip: 1, sSearch: '' })
    }
    return txt
  })

  useEffect(() => {
    setSelected(selectedItem)
  }, [selectedItem])

  return {
    items,
    setSelected,
    selected,
    loading,
    handleScroll,
    handleSearch,
    onApiResponce
  }
}

export default useReactSelect
