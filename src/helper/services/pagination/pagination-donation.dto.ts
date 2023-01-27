import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PaginationDonationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  perPages: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty()
  @IsString()
  sortFide?: string;

  @ApiProperty()
  @IsString()
  sortType?: string;

  @ApiProperty()
  @IsString()
  search?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startAt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  endAt: string;
}
