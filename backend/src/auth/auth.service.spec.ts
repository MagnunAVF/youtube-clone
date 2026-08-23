import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn(), createWithCredentials: jest.fn() };
  const jwtService = { sign: jest.fn() };
  const bcryptHashMock = bcrypt.hash as unknown as jest.Mock;
  const bcryptCompareMock = bcrypt.compare as unknown as jest.Mock;

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

  describe('login', () => {
    it('returns an access token when credentials are valid', async () => {
      const dto = { email: 'Ada@Example.com', password: 'supersecret' };
      const stored = {
        _id: { toString: () => '1' },
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hashed-password',
      };
      usersService.findByEmail.mockResolvedValue(stored);
      bcryptCompareMock.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('signed-jwt');

      const result = await service.login(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('ada@example.com');
      expect(bcryptCompareMock).toHaveBeenCalledWith('supersecret', 'hashed-password');
      expect(result).toEqual({
        accessToken: 'signed-jwt',
        user: { id: '1', displayName: 'Ada Lovelace', email: 'ada@example.com' },
      });
    });

    it('throws UnauthorizedException when the email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@example.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcryptCompareMock).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the user has no password set', async () => {
      usersService.findByEmail.mockResolvedValue({ _id: '1', displayName: 'No Password' });

      await expect(service.login({ email: 'ada@example.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcryptCompareMock).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        _id: '1',
        displayName: 'Ada Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hashed-password',
      });
      bcryptCompareMock.mockResolvedValue(false);

      await expect(service.login({ email: 'ada@example.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
