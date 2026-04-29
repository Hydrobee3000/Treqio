import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store'

/**
 * Типизированная версия useDispatch
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

/**
 * Типизированная версия useSelector
 */
export const useAppSelector = useSelector.withTypes<RootState>()
