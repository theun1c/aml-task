import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCommentDto } from './update-comment.dto';

describe('UpdateCommentDto', () => {
  it('should trim content during transformation', () => {
    const dto = plainToInstance(UpdateCommentDto, {
      content: '  Updated comment  ',
    });

    expect(dto.content).toBe('Updated comment');
  });

  it('should fail validation for whitespace-only content', async () => {
    const dto = plainToInstance(UpdateCommentDto, {
      content: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('content');
  });
});
