import { useState, useCallback } from 'react'
import { ApiError } from '../services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null })
      try {
        const data = await apiFunction(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        const apiError = error instanceof ApiError
          ? error
          : new ApiError(500, 'UNKNOWN_ERROR', 'An unexpected error occurred')
        setState({ data: null, loading: false, error: apiError })
        throw apiError
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
