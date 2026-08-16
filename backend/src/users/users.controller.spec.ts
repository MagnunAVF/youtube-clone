import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates creation to the service', async () => {
    const dto = { displayName: 'Ada Lovelace' };
    const created = { _id: '1', ...dto };
    usersService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });
});
