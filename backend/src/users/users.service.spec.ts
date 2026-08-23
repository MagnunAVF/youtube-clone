import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  const findByIdQuery = { exec: jest.fn() };
  const findOneQuery = { exec: jest.fn() };
  const userModel = {
    create: jest.fn(),
    findById: jest.fn(() => findByIdQuery),
    findOne: jest.fn(() => findOneQuery),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user via the model', async () => {
    const dto = { displayName: 'Ada Lovelace' };
    const created = { _id: '1', ...dto };
    userModel.create.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(userModel.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('finds a user by id via the model', async () => {
    const found = { _id: '1', displayName: 'Ada Lovelace' };
    findByIdQuery.exec.mockResolvedValue(found);

    const result = await service.findById('1');

    expect(userModel.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(found);
  });

  it('returns null when no user matches the id', async () => {
    findByIdQuery.exec.mockResolvedValue(null);

    const result = await service.findById('missing');

    expect(result).toBeNull();
  });

  it('finds a user by email via the model', async () => {
    const found = { _id: '1', displayName: 'Ada Lovelace', email: 'ada@example.com' };
    findOneQuery.exec.mockResolvedValue(found);

    const result = await service.findByEmail('ada@example.com');

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'ada@example.com' });
    expect(result).toEqual(found);
  });

  it('creates a user with credentials via the model', async () => {
    const input = {
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hashed',
    };
    const created = { _id: '1', ...input };
    userModel.create.mockResolvedValue(created);

    const result = await service.createWithCredentials(input);

    expect(userModel.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(created);
  });
});
