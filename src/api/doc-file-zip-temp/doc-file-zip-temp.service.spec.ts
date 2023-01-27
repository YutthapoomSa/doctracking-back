import { Test, TestingModule } from '@nestjs/testing';
import { DocFileZipTempService } from './service/doc-file-zip-temp.service';

describe('DocFileZipTempService', () => {
    let service: DocFileZipTempService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DocFileZipTempService],
        }).compile();

        service = module.get<DocFileZipTempService>(DocFileZipTempService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
