import { DraggableAttributes } from '@dnd-kit/core'
import dayjs from 'dayjs'
import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { FaStar } from 'react-icons/fa'
import { FaFlag, FaMoon } from 'react-icons/fa6'
import { twMerge } from 'tailwind-merge'
import { type Task } from '../../../../../src/store/types'
import { useTodoState } from '../../../../shared/lib/useTodoState'
import { OpenItem } from './OpenItem'

interface Props {
  task: Task
  dragHandleProps: DraggableAttributes & Record<string, any>
  isOpen: boolean
  onOpen: () => void
  onFocus: () => void
  toggle: (id: string) => void
  cancel: (id: string) => void
  close: () => void
  showStarIfToday?: boolean
  visibleDate?: boolean
  isFocused: boolean
}

export const TaskItem = ({
  task,
  toggle,
  dragHandleProps,
  isOpen,
  isFocused,
  showStarIfToday,
  visibleDate = false,
  cancel,
  onOpen,
  onFocus,
  close,
}: Props) => {
  const { editTodo } = useTodoState()

  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSave = (newValue: string) => {
    if (newValue.trim() !== '' && newValue !== task.text) {
      editTodo(task.id, { text: newValue })
    }
    close()
  }

  // useEffect(() => {
  //   if (isFocused) {
  //     ref.current?.focus()
  //   }
  //   if (isOpen) {
  //     inputRef.current?.focus()
  //   }
  // }, [isFocused, inputRef])

  return (
    <div
      ref={ref}
      className={twMerge(
        'flex items-center gap-3 group transition duration-75 px-1 rounded-sm',
        'focus:outline-none focus:ring-0 focus:border-none relative',
        isOpen && 'shadow-md py-1 border',
        isFocused && 'bg-blue-500/10'
      )}
      onClick={() => {
        if (!isOpen) {
          onFocus()
        }
      }}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          onClick={(e) => {
            if (e.altKey) {
              cancel(task.id)
            } else {
              toggle(task.id)
            }
          }}
          checked={!!task.completedAt}
          cancelled={!!task.cancelledAt}
        />
        {visibleDate && (task.completedAt || task.cancelledAt) && (
          <div className="text-sm font-medium whitespace-nowrap text-blue-500">
            {dayjs(new Date(task.completedAt || task.cancelledAt || '')).format(
              'MMM D'
            )}
          </div>
        )}
      </div>
      <div
        className={twMerge(
          'w-full h-[28px] flex gap-2 items-center overflow-hidden relative',
          !isOpen && 'cursor-move'
        )}
        {...(!isOpen && dragHandleProps)}
        onDoubleClick={() => {
          onOpen()
        }}
        onClick={() => {
          if (!isOpen) {
            onFocus()
          }
        }}
        tabIndex={undefined}
      >
        {showStarIfToday && task.when === 'today' && (
          <FaStar className="w-3.5 h-3.5 text-amber-300" />
        )}
        {showStarIfToday && task.when === 'tonight' && (
          <FaMoon className="w-3.5 h-3.5 text-blue-300" />
        )}
        {isOpen ? (
          <OpenItem
            ref={inputRef}
            blur={close}
            task={task}
            defaultValue={task.text}
            save={handleSave}
          />
        ) : (
          <div
            className={twMerge(
              'min-w-0 flex flex-row gap-2 items-center flex-1 cursor-pointer select-none text-[14px] px-1 py-0 transition-all text-ellipsis whitespace-nowrap overflow-hidden ',
              task.completedAt && 'opacity-40',
              task.cancelledAt && 'opacity-40 line-through'
            )}
          >
            {task.text || '\u00A0'}
          </div>
        )}
      </div>
      {task.highLeverage && (
        <div className="mr-2">
          <FaFlag className="w-3 h-3 text-red-500" />
        </div>
      )}
    </div>
  )
}

function Checkbox({
  checked,
  onClick,
  cancelled,
}: {
  checked: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  cancelled: boolean
}) {
  return (
    <button
      className={twMerge(
        'shrink-0',
        'w-4 h-4 border rounded flex items-center justify-center',
        (checked || cancelled) && 'bg-blue-500 border-blue-500',
        cancelled && ' border-dashed'
      )}
      onClick={onClick}
    >
      {checked && !cancelled && <Check className="w-3 h-3 text-white" />}
      {cancelled && <X className="w-3 h-3 text-white" />}
    </button>
  )
}
