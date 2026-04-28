// Типизированные хуки для работы со store.
// Используй их вместо useDispatch / useSelector из react-redux —
// они уже знают типы RootState и AppDispatch, не нужно указывать дженерики вручную.
//
// Пример: useAppSelector(state => state.api) вместо
//         useSelector((state: RootState) => state.api)
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
