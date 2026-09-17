/* eslint-disable no-unused-vars */
import React from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import AddSubmenuIcon from 'assets/images/add-submenu-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { FormattedMessage, useIntl } from 'react-intl'
import { useWatch } from 'react-hook-form'
import CommonInput from 'shared/components/common-input'
import { Drop } from 'shared/components/drag-and-drop'
import ToolTip from 'shared/components/tooltip'
import useCategoryFormField from 'shared/components/form-hook/useRecursiveFormField'
import { range } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

const getNewMenuItem = () => ({
  sTitle: '',
  sSlug: '',
  sUrl: '',
  aChildren: [],
  bIsMulti: false,
  bIsExternal: false,
  eUrlTarget: '_self',
  eMenuType: 'self'
})

const HeaderDraggableMenu = ({
  prefix = '',
  level = 0,
  nestingLimit = 0,
  category,
  categoryIndex,
  control,
  register,
  errors,
  formErrors,
  setValue,
  clearErrors,
  getValues,
  mainMenu,
  insert: prevInsert,
  remove: prevRemove
}) => {
  const { insert, remove, fields, passPrefix, CategoryArrayInputPath } = useCategoryFormField(prefix, control)
  const normalizedPrefix = passPrefix.endsWith('.') ? passPrefix.slice(0, -1) : passPrefix
  const [menuTitle, menuSlug, isExternalMenu] = useWatch({
    control,
    name: [`${normalizedPrefix}.sTitle`, `${normalizedPrefix}.sSlug`, `${normalizedPrefix}.bIsExternal`]
  })
  const isBrandMenu = level === 0 && (String(menuTitle || '').trim().toLowerCase() === 'brand' || String(menuSlug || '').trim() === '/')
  const externalSwitchId = `${normalizedPrefix}-bIsExternal`

  return (
    <Draggable draggableId={`${category?.id}:${CategoryArrayInputPath}`} drop index={categoryIndex}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Form.Group className="d-flex flex-column justify-content-center" style={{ marginLeft: '24px' }}>
              <div className="d-flex flex-wrap align-items-end" style={{ gap: '12px' }}>
                <div className='d-flex align-items-center mb-3 h6 align-self-center flex-shrink-0'>{range(1, level).map((r) => <span className='ps-1' key={r}>#</span>)}</div>
                <div className="d-flex flex-wrap flex-grow-1 align-items-end" style={{ gap: '12px', minWidth: '280px' }}>
                  <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
                    <CommonInput
                      register={register}
                      errors={errors}
                      className={errors?.sTitle && 'error'}
                      placeholder={useIntl().formatMessage({ id: 'menu' })}
                      as="input"
                      type="text"
                      name={`${normalizedPrefix}.sTitle`}
                      required
                    >
                      {errors && errors?.sTitle && (
                        <Form.Control.Feedback type="invalid">{errors?.sTitle.message}</Form.Control.Feedback>
                      )}
                    </CommonInput>
                  </div>
                  <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
                    <CommonInput
                      register={register}
                      errors={errors}
                      placeholder={useIntl().formatMessage({ id: 'menuSlug' })}
                      className={errors && errors?.sSlug && 'error'}
                      as="input"
                      type="text"
                      name={`${normalizedPrefix}.sSlug`}
                      required
                    >
                      {errors && errors?.sSlug && (
                        <Form.Control.Feedback type="invalid">{errors?.sSlug.message}</Form.Control.Feedback>
                      )}
                    </CommonInput>
                  </div>
                </div>
                <div className="flex-shrink-0 d-flex align-items-center justify-content-end mb-3 ms-auto" style={{ gap: '12px' }}>
                  {level > 0 && (
                    <ToolTip toolTipMessage="External Link">
                      <span
                        className="d-inline-flex align-items-center justify-content-center"
                        style={{
                          minWidth: '46px',
                          minHeight: '38px',
                          padding: '0 4px',
                          borderRadius: '999px',
                          background: isExternalMenu ? '#f2fbf5' : '#f8fafc',
                          border: `1px solid ${isExternalMenu ? '#9fd3b3' : '#d9e0ea'}`
                        }}
                      >
                        <Form.Check
                          type="switch"
                          id={externalSwitchId}
                          className="mb-0 d-inline-flex align-items-center"
                          label=""
                          {...register(`${normalizedPrefix}.bIsExternal`)}
                        />
                      </span>
                    </ToolTip>
                  )}
                  {level <= (nestingLimit - 1) ? (
                    <ToolTip toolTipMessage={<FormattedMessage id="addSubMenu" />}>
                      <Button
                        variant="outline-secondary"
                        className="square icon-btn"
                        size="lg"
                        onClick={() => insert(fields?.length, getNewMenuItem())}
                      >
                        <img src={AddSubmenuIcon} alt="add-submenu-icon" width={20} />
                      </Button>
                    </ToolTip>
                  ) : null}
                  <ToolTip toolTipMessage={<FormattedMessage id="addNewMenu" />}>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      className="square icon-btn"
                      onClick={() => prevInsert(categoryIndex + 1, getNewMenuItem())}
                    >
                      <i className="icon-add d-block" />
                    </Button>
                  </ToolTip>
                  {(mainMenu?.length > 5 && level === 0) || level > 0 ? (
                    <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
                      <Button variant="outline-danger" onClick={() => prevRemove(categoryIndex)} size="lg" className="square icon-btn">
                        <i className="icon-delete d-block" />
                      </Button>
                    </ToolTip>
                  ) : null}
                  <img src={DragIcon} alt="drag-icon" {...provided.dragHandleProps} width={20} />
                </div>
              </div>
              {isBrandMenu && (
                <Row className="g-3 mb-3">
                  <Col lg={6} className="add-article">
                    <CategoryPlayerTeamImage
                      title="Logo Only"
                      galleryType="icon"
                      name={`${normalizedPrefix}.oLogoOnly`}
                      register={register}
                      setValue={setValue}
                      values={getValues()}
                      errors={formErrors}
                      clearErrors={clearErrors}
                      hideCaption
                      hideAttribution
                    />
                  </Col>
                  <Col lg={6} className="add-article">
                    <CategoryPlayerTeamImage
                      title="Logo With Text"
                      galleryType="icon"
                      name={`${normalizedPrefix}.oLogoWithText`}
                      register={register}
                      setValue={setValue}
                      values={getValues()}
                      errors={formErrors}
                      clearErrors={clearErrors}
                      hideCaption
                      hideAttribution
                    />
                  </Col>
                </Row>
              )}
              <Drop key={category?.id} id={`${category?.id}:${CategoryArrayInputPath}`} type={`droppable-item:${level}`}>
                {fields?.map((item, index) => {
                  return (
                    <HeaderDraggableMenu
                      key={item?.id}
                      level={level + 1}
                      nestingLimit={nestingLimit}
                      category={item}
                      mainMenu={fields}
                      prefix={`${passPrefix}aChildren.${index}.`}
                      categoryIndex={index}
                      register={register}
                      errors={errors?.aChildren?.[index]}
                      formErrors={formErrors}
                      control={control}
                      setValue={setValue}
                      clearErrors={clearErrors}
                      getValues={getValues}
                      insert={insert}
                      remove={remove}
                    />
                  )
                })}
              </Drop>
            </Form.Group>
          </div>
        )
      }}
    </Draggable>
  )
}

HeaderDraggableMenu.propTypes = {
  category: PropTypes.object,
  control: PropTypes.object,
  prefix: PropTypes.string,
  namePrefix: PropTypes.string,
  prevLevelId: PropTypes.string,
  level: PropTypes.number,
  nestingLimit: PropTypes.number,
  categoryIndex: PropTypes.number,
  insert: PropTypes.func,
  remove: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  formErrors: PropTypes.object,
  getValues: PropTypes.func,
  mainMenu: PropTypes.array,
  setHeaderMenu: PropTypes.func,
  setValue: PropTypes.func,
  clearErrors: PropTypes.func
}
export default HeaderDraggableMenu
