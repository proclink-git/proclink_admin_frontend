import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useParams } from 'react-router-dom'
import moment from 'moment'

import { VIEW_USER_DETAILS } from 'graph-ql/end-user/query'
import { getGender, getS3Url } from 'shared/utils'
import userImage from 'assets/images/user-pic.jpg'

function DetailEndUser() {
  const [userData, setUserData] = useState()
  const { id } = useParams()
  const [getFrontUserById] = useLazyQuery(VIEW_USER_DETAILS, {
    onCompleted: (data) => {
      if (data?.viewUserDetail) {
        setUserData(data.viewUserDetail.oData)
      }
    }
  })
  useEffect(() => {
    id &&
      getFrontUserById({
        variables: { input: { iId: id } }
      })
  }, [id])

  return (
    <div className="end-user-details">
      <div>
        <div className="d-flex">
          <div className="img-box">
            <img src={userData?.sProPic ? getS3Url(userData?.sProPic) : userImage} alt={userData?.sFullName} />
          </div>
          <div className="user-personal-info">
            <h4>{userData?.sFullName}</h4>
            <h5 className="username">{userData?.sUsername || '-'}</h5>
            <Row className="mt-5">
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="email" />
                  </p>
                  <p className="form-data">{userData?.sEmail || '-'}</p>
                </div>
              </Col>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="gender" />
                  </p>
                  <p className="form-data"> {userData?.eGender ? getGender(userData?.eGender) : '-'}</p>
                </div>
              </Col>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="city" />
                  </p>
                  <p className="form-data">{userData?.sCity || '-'}</p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="phoneNumber" />
                  </p>
                  <p className="form-data"> {userData?.sMobNum || '-'}</p>
                </div>
              </Col>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="dob" />
                  </p>
                  <p className="form-data">{userData?.dDOB ? moment(Number(userData?.dDOB)).format('DD-MM-YYYY') : '-'}</p>
                </div>
              </Col>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="country" />
                  </p>
                  <p className="form-data">{userData?.oCountry?.sName || '-'}</p>
                </div>
              </Col>
              <Col sm={3}>
                <div className="d-flex item">
                  <p className="label">
                    <FormattedMessage id="joined" />
                  </p>
                  <p className="form-data">{userData?.dCreated ? moment(Number(userData?.dCreated)).format('ddd MMM DD YYYY') : '-'}</p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <hr />
      <Row>
        <Col sm={12} className="mt-4">
          <p className="label">
            <FormattedMessage id="about" />
          </p>
          <p className="label">
            <FormattedMessage id="bio" />
          </p>
          <p className="form-data">{userData?.sBio || '-'}</p>
          <hr />
        </Col>
      </Row>
      <Row>
        <Col sm={12} className="mt-4">
          <p className="label">
            <FormattedMessage id="socialLinks" />
          </p>
          {!userData?.aSLinks?.length && (
            <h3 className="text-center mt-5">
              <FormattedMessage id="noSocialLinkFound" />
            </h3>
          )}
          {userData?.aSLinks?.length !== 0 && (
            <Row>
              <Col sm={3}>
                <div>
                  <p className="label">
                    <FormattedMessage id="socialNetwork" />
                  </p>
                </div>
              </Col>
              <Col sm={3}>
                <div>
                  <p className="label">
                    <FormattedMessage id="displayName" />
                  </p>
                </div>
              </Col>
              <Col sm={3}>
                <div>
                  <p className="label">
                    <FormattedMessage id="link" />
                  </p>
                </div>
              </Col>
              {userData?.aSLinks?.map((link, index) => (
                <Row key={index}>
                  <Col sm={3}>{link?.eSocialNetworkType}</Col>
                  <Col sm={3}>{link?.sDisplayName}</Col>
                  <Col sm={3}>{link?.sLink}</Col>
                </Row>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default DetailEndUser
