import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

/**
 * Данные для отправки заявки в друзья.
 */
export class SendFriendRequestDto {
  /** Username пользователя, которому отправляется заявка. */
  @ApiProperty({ description: 'Username пользователя, которому отправляется заявка' })
  @IsString()
  @IsNotEmpty()
  username!: string
}
