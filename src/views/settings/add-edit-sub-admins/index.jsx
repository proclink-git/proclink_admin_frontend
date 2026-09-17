import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router'
import { useLazyQuery, useMutation } from '@apollo/client'
import { Form } from 'react-bootstrap'

import StepOne from 'shared/components/user-steps/StepOne'
import StepTwo from 'shared/components/user-steps/StepTwo'
import { ADD_USER, GET_USER, EDIT_USER } from 'graph-ql/settings/user'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { encryption } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'

function AddEditUser() {
  const { id } = useParams()
  const [userData, setUserData] = useState({})
  const [formData, setFormData] = useState({})
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)

  const {
    register: stepOneField,
    handleSubmit: stepOneSubmit,
    formState: { errors: stepOneErrors },
    watch,
    setValue,
    trigger,
    setError: setStepOneError,
    clearErrors: clearStepOneError,
    reset: resetStepOne
  } = useForm({ mode: 'all', defaultValues: { sProfilePicture: '' } })

  const [addUser] = useMutation(ADD_USER, {
    onCompleted: (data) => {
      if (data && data?.createSubAdmin) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.createSubAdmin.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.push(allRoutes.subAdmins)
      }
    }
  })

  const [editUser] = useMutation(EDIT_USER, {
    onCompleted: (data) => {
      if (data && data?.editSubAdmin) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSubAdmin.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        history.push(allRoutes.subAdmins)
      }
    }
  })

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data) {
        const urls = data.generatePreSignedUrl
        const uploadData = []
        const allData = formData
        urls.forEach((item) => {
          if (item.sType === 'profile') {
            uploadData.push({ sUploadUrl: item.sUploadUrl, file: allData.sProfilePicture.files[0] })
            allData.sProfilePicture = item.sS3Url
          }
        })
        uploadImage(uploadData)
          .then((res) => {
            prepareUserData(allData)
          })
          .catch((err) => {
            console.log('err', err)
          })
      }
    }
  })

  const [getSubAdmin] = useLazyQuery(GET_USER, {
    onCompleted: (data) => {
      if (data && data.getSubAdmin) {
        setUserData(data.getSubAdmin)
        prepareStepData(data.getSubAdmin)
      }
    }
  })

  useEffect(() => {
    if (id) {
      getSubAdmin({ variables: { input: { _id: id } } })
    }
  }, [id])

  function changeStep(number, data) {
    setFormData({ ...formData, ...data })
    onAddUser({ ...formData, ...data })
  }

  function onAddUser(formValue) {
    const { value, data } = getPreSignedData(formValue)
    setFormData(data)
    if (data.sProfilePicture && data.sProfilePicture.files && data.sProfilePicture.files[0] instanceof File) {
      generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
    } else {
      prepareUserData(data)
    }
  }

  function prepareUserData(value) {
    const data = JSON.parse(JSON.stringify(value))
    // encrypt fields
    if (!id) {
      data.sPassword = encryption(data.sPassword)
      data.sConfirmPassword = encryption(data.sConfirmPassword)
    }
    // Check Images url updated Or not
    if (id) {
      if (data.sProfilePicture === '') data.sProfilePicture = userData.sUrl
    }
    delete data.profile
    id ? editUser({ variables: { input: { _id: id, ...data } } }) : addUser({ variables: { input: data } })
  }

  function prepareStepData(data) {
    resetStepOne({
      sFullName: data.sFName,
      sEmail: data.sEmail,
      sNumber: data.sNumber,
      eGender: data.eGender,
      sUserName: data.sUName,
      sProfilePicture: ''
    })
  }

  return (
    <Form className="step-one" autoComplete="off">
      <div className="user-container">
        <StepOne
          register={stepOneField}
          watch={watch}
          errors={stepOneErrors}
          setValue={setValue}
          setError={setStepOneError}
          clearErrors={clearStepOneError}
          id={id}
          sProfilePicture={userData?.sUrl}
          profilePictureUpdate={(e) => setUserData({ ...userData, sUrl: e })}
          sUserName={userData.sUName}
        />
        <StepTwo
          register={stepOneField}
          setValue={setValue}
          watch={watch}
          errors={stepOneErrors}
          trigger={trigger}
          id={id}
          selectedRole={userData.aAssignedRolePermissions}
          nextStep={changeStep}
          submit={stepOneSubmit}
        />
      </div>
    </Form>
  )
}
export default AddEditUser
