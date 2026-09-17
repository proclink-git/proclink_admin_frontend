import React from 'react'
import TwitterCard from 'shared/components/social-dashboard/twitter-card'
import InstagramCard from 'shared/components/social-dashboard/instagram-card'
import FacebookCard from 'shared/components/social-dashboard/facebook-card'
import LinkedinCard from 'shared/components/social-dashboard/linkedin-card'

function SocialDashboard() {
  return (
    <>
      <div className="row gx-3 justify-content-center mt-2 pb-5 text-white">
        <div className='col-md-6 col-xl-3 my-2'><TwitterCard /></div>
        <div className='col-md-6 col-xl-3 my-2'><InstagramCard /></div>
        <div className='col-md-6 col-xl-3 my-2'><FacebookCard /></div>
        <div className='col-md-6 col-xl-3 my-2'><LinkedinCard /></div>
      </div>
    </>
  )
}

export default SocialDashboard
