import { BadRequestException } from '@nestjs/common';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('returns the value unchanged when it is a valid ObjectId', () => {
    expect(pipe.transform('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
  });

  it('throws BadRequestException for a malformed id', () => {
    expect(() => pipe.transform('not-an-object-id')).toThrow(BadRequestException);
  });
});
