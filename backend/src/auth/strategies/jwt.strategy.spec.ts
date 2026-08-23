import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const usersService = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test-secret' } },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the user for a payload referencing an existing user', async () => {
    const user = { _id: '1', displayName: 'Ada Lovelace' };
    usersService.findById.mockResolvedValue(user);

    const result = await strategy.validate({ sub: '1' });

    expect(usersService.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('throws UnauthorizedException when the user no longer exists', async () => {
    usersService.findById.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 'missing' })).rejects.toThrow(UnauthorizedException);
  });
});
