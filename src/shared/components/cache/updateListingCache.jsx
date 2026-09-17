import { useApolloClient } from '@apollo/client'

function UpdateListingCache() {
  const client = useApolloClient()

  function getOldData(QUERY, variable) {
    return client.readQuery({
      query: QUERY,
      variables: variable
    })
  }

  function updateListingData(QUERY, variable, key, id, updatedData) {
    const oldData = getOldData(QUERY, variable)
    const data = { [key]: { total: oldData[key].total, results: [...oldData[key].results] } }
    data[key].results = data[key].results.map((e) => {
      if (e._id === id) {
        return { ...e, ...updatedData }
      } else {
        return e
      }
    })
    client.writeQuery({
      query: QUERY,
      data: data,
      variables: variable
    })
  }

  return { updateListingData }
}
export default UpdateListingCache
