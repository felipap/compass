import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useBackendState } from '../../../shared/ipc'
import { FaHandPeace, FaSkull } from '../../../shared/ui/icons'
import { withBoundary } from '../../../shared/ui/withBoundary'

const ONE_MINUTE = 1 * 60 * 1_000

// Would prefer to call it Feedback but don't want to conflict with the goal
// feedback component.
export const Feedback = withBoundary(() => {
  const { state } = useBackendState()
  useUpdateEvery(20_000)

  const relevantCapture =
    state &&
    state.activeCapture &&
    // within the last 2 minutes
    new Date(state.activeCapture.at).getTime() > Date.now() - ONE_MINUTE &&
    state.session &&
    // Goal started before last capture
    new Date(state.activeCapture.at).getTime() >
      new Date(state.session.startedAt).getTime() &&
    // Goal was not updated or was updated before last capture
    (!state.session.contentUpdatedAt ||
      new Date(state.session.contentUpdatedAt).getTime() <
        new Date(state.activeCapture.at).getTime()) &&
    // Goal was not paused since last capture
    (!state.session.pausedAt ||
      new Date(state.session.pausedAt).getTime() >
        new Date(state.activeCapture.at).getTime()) &&
    state.activeCapture

  console.log('relevantCapture', relevantCapture)

  if (!relevantCapture) {
    return <AnimatePresence></AnimatePresence>
  }

  let inner = null
  let className = 'text-gray-500'
  if (relevantCapture.impossibleToAssess) {
    inner = <>Improve your goal</>
  } else if (relevantCapture.inFlow) {
    inner = (
      <>
        Doing great
        <FaHandPeace className="h-3 w-3 text-green-800 dark:text-green-300" />
      </>
    )
    className = 'text-green-800 dark:text-green-300'
  } else {
    inner = (
      <>
        Try to concentrate{' '}
        <FaSkull className="h-3 w-3 text-red-800 dark:text-red-300" />
      </>
    )
    className = 'text-red-800 dark:text-red-300'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className={twMerge(
            'text-[14px] pr-3 font-medium text-gray-500 font-display-3p overflow-hidden text-ellipsis whitespace-nowrap flex flex-row gap-2 items-center',
            className
          )}
        >
          {inner}
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

function useUpdateEvery(ms: number) {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1)
    }, ms)
    return () => clearInterval(interval)
  }, [ms])
}
