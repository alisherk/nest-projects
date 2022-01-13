import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  let fakeUsersService: Partial<UsersService>;

  const users: User[] = [];

  beforeEach(async () => {
    //create fake copy
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed pass', async () => {
    const user = await service.signup('test@test.com', 'asdf');

    expect(user.password).not.toEqual('asdf');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();

    expect(hash).toBeDefined();
  });

  it('throws en error if user signs up with email that is in use', async () => {
    await service.signup('user@mail.com', 'pass');

    await expect(
      service.signup('user@mail.com', 'pass'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if signin is called with unused email', async () => {
    await expect(
      service.signin('user@test.com', 'pass'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws if invalid password is provided', async () => {
    await service.signup('usering@mail.com', 'password');

    await expect(
      service.signin('usering@mail.com', 'pass'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test1@test.com', 'password');

    const user = await service.signin('test1@test.com', 'password');

    expect(user).toBeDefined();
  });
});
