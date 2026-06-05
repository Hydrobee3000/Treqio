import { PartialType } from '@nestjs/swagger'
import { CreateBookDto } from './create-book.dto'

/**
 * Данные для обновления книги — все поля необязательны.
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
