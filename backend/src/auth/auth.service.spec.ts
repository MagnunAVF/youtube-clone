import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn(), createWithCredentials: jest.fn() };
  const jwtService = { sign: jest.fn() };
  const bcryptHashMock = bcrypt.hash as unknown as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with a hashed password and returns an access token', async () => {
    const dto = { displayName: 'Ada Lovelace', email: 'Ada@Example.com', password: 'supersecret' };
    usersService.findByEmail.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue('hashed-password');
    const created = {
      _id: { toString: () => '1' },
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
    };
    usersService.createWithCredentials.mockResolvedValue(created);
    jwtService.sign.mockReturnValue('signed-jwt');

    const result = await service.signup(dto);

    expect(usersService.findByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(bcryptHashMock).toHaveBeenCalledWith('supersecret', 10);
    expect(usersService.createWithCredentials).toHaveBeenCalledWith({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hashed-password',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1' });
    expect(result).toEqual({
      accessToken: 'signed-jwt',
      user: { id: '1', displayName: 'Ada Lovelace', email: 'ada@example.com' },
    });
  });

  it('throws ConflictException when the email is already registered', async () => {
    const dto = { displayName: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret' };
    usersService.findByEmail.mockResolvedValue({ _id: 'existing' });

    await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    expect(usersService.createWithCredentials).not.toHaveBeenCalled();
  });
});
