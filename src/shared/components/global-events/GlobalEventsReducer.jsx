export default (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_PROFILE':
      return {
        ...state,
        profileData: action.payload.profileData
      }
    default:
      return state
  }
}
