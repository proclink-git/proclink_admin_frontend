import React from 'react'
import { Button } from 'react-bootstrap'
import CommonInput from '../common-input'
import instagramImg from 'assets/images/instagram.svg'
import twitterImg from 'assets/images/twitter.svg'
import youtubeImg from 'assets/images/youtube.svg'
import PropTypes from 'prop-types'

export default function SocialLinkPreview({ register, handleSocialPreview }) {
  return (
    <div className='w-100 d-flex my-4'>
      <CommonInput
        type='text'
        register={register}
        placeholder='add Instagram url, Tweet id or Youtube url'
        displayClass='mb-0'
        name="social-url-preview"
      />
      <Button size='sm' variant="primary" className='square ms-2' onClick={() => handleSocialPreview('instagram')} >
        <img src={instagramImg} alt="instagram" />
      </Button>
      <Button size='sm' variant="primary" className='square ms-2' onClick={() => handleSocialPreview('twitter')} >
        <img src={twitterImg} alt="twitter" />
      </Button>
      <Button size='sm' variant="primary" className='square ms-2' onClick={() => handleSocialPreview('youtube')} >
        <img src={youtubeImg} alt="youtube" />
      </Button>
    </div>
  )
}

SocialLinkPreview.propTypes = {
  register: PropTypes.func,
  handleSocialPreview: PropTypes.func
}
