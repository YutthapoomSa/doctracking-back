import { PartialType } from '@nestjs/swagger';
import { CreateDocFileDTOReq } from './create-doc-file.dto';

export class UpdateDocFileDto extends PartialType(CreateDocFileDTOReq) {}
