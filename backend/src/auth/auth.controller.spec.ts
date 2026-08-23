import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { signup: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates signup to the service', async () => {
    const dto = { displayName: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret' };
    const response = {
      accessToken: 'signed-jwt',
      user: { id: '1', displayName: 'Ada Lovelace', email: 'ada@example.com' },
    };
    authService.signup.mockResolvedValue(response);

    const result = await controller.signup(dto);

    expect(authService.signup).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });
});
