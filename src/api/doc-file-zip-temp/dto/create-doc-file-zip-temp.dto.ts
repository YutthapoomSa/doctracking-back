import { ApiProperty } from '@nestjs/swagger';

export class CreateDocFileZipTempDto {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    images: any;
}
