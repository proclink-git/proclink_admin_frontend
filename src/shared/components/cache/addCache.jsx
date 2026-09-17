import { useApolloClient } from '@apollo/client'

function AddCache() {
  const client = useApolloClient()

  function addCacheData(QUERY, variable, updatedData, getKeyName) {
    client.writeQuery({
      query: QUERY,
      data: { [getKeyName]: updatedData },
      variables: variable
    })
  }
  return { addCacheData }
}
export default AddCache
