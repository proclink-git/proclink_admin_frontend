import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'
import { LIST_HEADER_CATEGORY_ARTICLE } from 'graph-ql/article/query'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import useReactSelect from 'shared/hooks/useReactSelect'

export default function DownloadablePopup() {
  const {
    register,
    formState: { errors },
    control,
    setValue,
    getValues,
    clearErrors
  } = useFormContext()

  const { onApiResponce, handleScroll, handleSearch, loading, items } = useReactSelect({
    query: LIST_HEADER_CATEGORY_ARTICLE,
    requestParams: {
      eHeaderCategoryType: 'wp',
      nLimit: 20,
      nOrder: -1,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated'
    },
    responceCallBack: (data) => {
      onApiResponce(data?.listHeaderCategoryArticle?.aResults)
    }
  })
  return (
    <Row>
      <Col xs={8}>
        <Row>
          <Col xs={12}>
            <Form.Group className="form-group">
              <Form.Label>Select White paper*</Form.Label>
              <Controller
                name="oDownloadableContentPopup.iWhitePaperId"
                rules={{ required: validationErrors.required }}
                control={control}
                render={({ field: { onChange, value = [], ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      isLoading={loading}
                      // placeholder={<FormattedMessage id="categoryOnlyOne" />}
                      value={value}
                      options={items}
                      getOptionLabel={(option) => option.sTitle}
                      getOptionValue={(option) => option._id}
                      className={`react-select ${errors?.oDownloadableContentPopup?.iWhitePaperId && 'error'}`}
                      classNamePrefix="select"
                      onInputChange={handleSearch}
                      isSearchable
                      onMenuScrollToBottom={handleScroll}
                      onChange={onChange}
                    />
                  )
                }}
              />
              {errors.oDownloadableContentPopup?.iWhitePaperId && (
                <Form.Control.Feedback className="pt-1" type="invalid">
                  {errors.oDownloadableContentPopup?.iWhitePaperId.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oDownloadableContentPopup?.sBadge && 'error'}
              name="oDownloadableContentPopup.sBadge"
              label="Badge"
              placeholder="New"
              required
              validation={{ maxLength: { value: 50, message: validationErrors.maxLength(50) } }}
            />
          </Col>
          <Col sm={6}>
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors?.oDownloadableContentPopup?.sCTAText && 'error'}
              name="oDownloadableContentPopup.sCTAText"
              label="Button Text"
              placeholder="Download Now"
              validation={{ maxLength: { value: 25, message: validationErrors.maxLength(25) } }}
              required
            />
          </Col>
        </Row>
      </Col>
      <Col sm={4} className="add-article">
      <CategoryPlayerTeamImage
          galleryType="pub"
          title="Image"
          name="oBannerImage"
          register={register}
          setValue={setValue}
          values={getValues()}
          clearErrors={clearErrors}
          errors={errors}
          hideCaption
          hideAttribution
          required
        />
      </Col>
    </Row>
  )
}
