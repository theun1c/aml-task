import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  it('should trim content during transformation', () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: '  Comment text  ',
    });

    expect(dto.content).toBe('Comment text');
  });

  it('should fail validation for whitespace-only content', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('content');
  });
});
