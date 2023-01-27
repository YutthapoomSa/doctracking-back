import { Test, TestingModule } from '@nestjs/testing';
import { DocFileZipTempController } from './doc-file-zip-temp.controller';
import { DocFileZipTempService } from './service/doc-file-zip-temp.service';

describe('DocFileZipTempController', () => {
    let controller: DocFileZipTempController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DocFileZipTempController],
            providers: [DocFileZipTempService],
        }).compile();

        controller = module.get<DocFileZipTempController>(DocFileZipTempController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
