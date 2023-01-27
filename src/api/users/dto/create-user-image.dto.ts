import { ApiProperty } from '@nestjs/swagger';

export class CreateUserImage {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    image: any;
}
