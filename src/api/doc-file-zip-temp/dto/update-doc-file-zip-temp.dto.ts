import { PartialType } from '@nestjs/swagger';
import { CreateDocFileZipTempDto } from './create-doc-file-zip-temp.dto';

export class UpdateDocFileZipTempDto extends PartialType(CreateDocFileZipTempDto) {}
