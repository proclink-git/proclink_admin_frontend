import PropTypes from 'prop-types'
import { useApolloClient } from '@apollo/client'
import { GET_USER_PERMISSION } from 'graph-ql/permission/query'

function PermissionProvider({ children, isAllowedTo, isArray }) {
  const client = useApolloClient()
  const data = client.readQuery({
    query: GET_USER_PERMISSION
  })

  if (isArray) {
    return data?.getUserPermissions?.filter((p) => isAllowedTo.includes(p)).length ? children : null
  } else {
    return data?.getUserPermissions?.includes(isAllowedTo) ? children : null
  }
}
PermissionProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node
  ]).isRequired,
  isAllowedTo: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  isArray: PropTypes.bool
}
export default PermissionProvider
