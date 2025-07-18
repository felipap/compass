import { useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useProjects } from '../../../../shared/ipc'
import { useTodoState } from '../../../../shared/lib/useTodoState'
import { AutoExpandingTextarea } from '../../../../shared/ui/AutoExpandingTextarea'
import { Button } from '../../../../shared/ui/Button'
import { Layout, PageTitle } from '../../../components/Layout'
import { ProjectProgressIndicator } from '../../../components/Sidebar'
import { TaskList } from '../../../components/TaskList'

export default function Screen() {
  // params
  const { projectId } = useParams({ from: '/project/$projectId' })

  // data
  const { tasks, addTodo } = useTodoState()
  const { projects } = useProjects()

  // state
  const [loggedVisible, setLoggedVisible] = useState(false)

  const project = projects.find((p) => p.id === projectId)

  const nonDeletedTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.projectId === projectId && !task.deletedAt
    )
  }, [tasks, projectId])

  const loggedTasks = useMemo(() => {
    return nonDeletedTasks.filter((task) => task.loggedAt)
  }, [nonDeletedTasks])

  const nonLoggedTasks = useMemo(() => {
    return nonDeletedTasks.filter((task) => !task.loggedAt)
  }, [nonDeletedTasks])

  if (!project) {
    return <div>Project not found</div>
  }

  function handleAddTodo() {
    addTodo({ projectId })
  }

  return (
    <Layout
      key={project.id}
      title={
        <div className="flex flex-col gap-2 w-full">
          <PageTitle
            title={project.title}
            icon={<ProjectProgressIndicator projectId={project.id} />}
          />
          <NoteInput projectId={project.id} />
        </div>
      }
      page="project"
      icon={<ProjectProgressIndicator projectId={project.id} />}
      handleAddTodo={handleAddTodo}
    >
      <TaskList tasks={nonLoggedTasks} showStarIfToday />
      <div className="mt-3">
        <Button
          onClick={() => setLoggedVisible(!loggedVisible)}
          variant="plain"
          className="text-sm"
        >
          {loggedVisible ? 'Hide logged' : 'Show logged'}
        </Button>
      </div>
      {loggedVisible && <TaskList tasks={loggedTasks} showStarIfToday />}
    </Layout>
  )
}

function NoteInput({ projectId }: { projectId: string }) {
  const { projects, editProject } = useProjects()
  const project = projects.find((p) => p.id === projectId)
  const [value, setValue] = useState<string>(project?.description ?? '')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (project?.description) {
      setValue(project.description)
    }
  }, [project?.description])

  function onBlur() {
    editProject(projectId, { description: value })
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <AutoExpandingTextarea
        ref={ref}
        className={twMerge(
          'text-gray-400 p-0 text-[14px] border-none outline-none w-full ring-0 resize-none leading-[135%]',
          value ? '' : 'text-grey-300 italic'
        )}
        value={value}
        placeholder="Note"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            ref.current?.blur()
          } else {
            e.stopPropagation()
          }
        }}
        onBlur={onBlur}
        onChange={(value) => {
          setValue(value)
          editProject(projectId, { description: value })
        }}
      />
    </div>
  )
}
