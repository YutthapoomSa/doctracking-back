import { ApiProperty } from '@nestjs/swagger';

export class QueryAgencyLists {
    @ApiProperty()
    agencyRecipientId: string;

    @ApiProperty()
    agencySecondaryRecipientId: string;

    @ApiProperty()
    agencySenderId: string;

    @ApiProperty()
    agencySecondarySenderId: string;
}
