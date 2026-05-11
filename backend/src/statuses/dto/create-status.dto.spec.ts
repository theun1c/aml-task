import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateStatusDto } from './create-status.dto';

describe('CreateStatusDto', () => {
  it('should trim name during transformation', () => {
    const dto = plainToInstance(CreateStatusDto, {
      name: '  Review  ',
      category: 'in_progress',
    });

    expect(dto.name).toBe('Review');
  });

  it('should fail validation for whitespace-only name', async () => {
    const dto = plainToInstance(CreateStatusDto, {
      name: '   ',
      category: 'in_progress',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
