import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateStatusDto } from './update-status.dto';

describe('UpdateStatusDto', () => {
  it('should trim name during transformation', () => {
    const dto = plainToInstance(UpdateStatusDto, {
      name: '  Ready for Review  ',
    });

    expect(dto.name).toBe('Ready for Review');
  });

  it('should fail validation for whitespace-only name', async () => {
    const dto = plainToInstance(UpdateStatusDto, {
      name: '   ',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
