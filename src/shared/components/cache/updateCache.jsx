import { useApolloClient } from '@apollo/client'

function UpdateCache() {
  const client = useApolloClient()

  function getOldData(QUERY, variable) {
    return client.readQuery({
      query: QUERY,
      variables: variable
    })
  }
  function updateCacheData(QUERY, variable, updatedData, getKeyName) {
    const oldData = getOldData(QUERY, variable)
    if (getKeyName) {
      client.writeQuery({
        query: QUERY,
        data: { [getKeyName]: oldData ? { ...oldData[getKeyName], ...updatedData } : { ...updatedData } },
        variables: variable
      })
    }
  }
  return { updateCacheData }
}
export default UpdateCache
