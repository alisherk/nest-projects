import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  let fakeUsersService: Partial<UsersService>;

  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@asdf.com',
          password: 'asdf',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'asdf' } as User]);
      },
      //remove: () => {},
      //update: () => {},
    };

    fakeAuthService = {
      //signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns a list of users with given email', async () => {
    const users = await controller.findAllUsers('asdf@asdf.com');

    expect(users.length).toEqual(1);

    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('returns user by id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throws error', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: null };

    const user = await controller.signin(
      { email: 'asdf@asdf.com', password: 'asdf' },
      session,
    );

    expect(user.id).toEqual(1); 

    expect(session.userId).toEqual(1)
  });
});
