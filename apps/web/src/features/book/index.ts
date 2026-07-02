export {
  useGetBooksQuery,
  useGetMyEntriesQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
} from './api/booksApi'
export type {
  CreateBookDto,
  UpdateBookDto,
  CreateBookEntryDto,
  UpdateBookEntryDto,
} from './api/booksApi'
