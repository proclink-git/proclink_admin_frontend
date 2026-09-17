import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Loading from 'shared/components/loading'
import CountCard from './components/CountCard'
import { CustomReactSelect } from './components/CustomReactSelect/CustomReactSelect'
import TaskStatusList from './components/TaskStatusList'
import useDashboard from './useDashboard'

function Dashboard() {
  const {
    isAdmin,
    userName,
    dashboardData,
    loading,
    DateRangeFilter,
    currentSubAdmin,
    setCurrentSubAdmin,
    handleScroll,
    handleSearch,
    subAdmin
  } = useDashboard()

  const counts = dashboardData?.getDashBoardArticle?.oCount
  const tasksList = dashboardData?.getDashBoardArticle?.oResult

  return (
    <>
      {loading && <Loading />}

      <section className="w-100 d-flex justify-content-between dashboard-header">
        <div className="d-flex mt-3 flex-column">
          <div className="dashboard-greeting">
            <FormattedMessage id="Hello" /> {userName}
          </div>
          <div className="subtitle-color dashboard-subtitle">
            <FormattedMessage id="ThisIsHowYourDay" />
          </div>
        </div>

        {!isAdmin && <DateRangeFilter />}
      </section>

      <section className="d-flex flex-wrap flex-lg-nowrap gap-4 justify-content-center justify-content-lg-start mt-4 pb-5 count-card-list">
        <CountCard title="Pendings" count={counts?.nPending} />
        <CountCard title="Review" count={counts?.nReview} />
        <CountCard title="Writing" count={counts?.nWriting} />
        <CountCard title="Published" count={counts?.nPublished} />
      </section>

      {isAdmin && (
        <Row className="g-3 mt-3 dashboard-filter-row">
          <Col lg="auto">
            <CustomReactSelect
              value={currentSubAdmin}
              // isLoading={isSubAdminsLoading}
              getOptionLabel={(option) => option.sFName}
              getOptionValue={(option) => option._id}
              options={subAdmin || []}
              onInputChange={handleSearch}
              onMenuScrollToBottom={handleScroll}
              placeholder="Select User"
              onChange={(val) => {
                setCurrentSubAdmin(val)
              }}
            />
          </Col>
          <Col lg="auto">
            <DateRangeFilter />
          </Col>
        </Row>
      )}

      <section className="py-2 task-status-list-wrapper">
        <Row className="justify-content-center">
          <Col lg={3}>
            <TaskStatusList isAdmin={isAdmin} title="Pendings" color="yellow" tasks={tasksList?.aPending} toolTipText='pendingArticleDashboardToolTip' />
          </Col>
          <Col lg={3}>
            <TaskStatusList isAdmin={isAdmin} title="Review" color="green" tasks={tasksList?.aReview} toolTipText='reviewArticleDashboardToolTip'/>
          </Col>
          <Col lg={3}>
            <TaskStatusList isAdmin={isAdmin} title="Writing" color="purple" tasks={tasksList?.aWriting} toolTipText='writingArticleDashboardToolTip' />
          </Col>
          <Col lg={3}>
            <TaskStatusList isAdmin={isAdmin} title="Published" color="primary" tasks={tasksList?.aPublished} toolTipText='publishArticleDashboardToolTip'/>
          </Col>
        </Row>
      </section>
    </>
  )
}

export default Dashboard
