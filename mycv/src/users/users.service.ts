import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  //InjectRepository(User) is required only because Repository<User> does not play nicely with generics
  constructor(@InjectRepository(User) private repo: Repository<User>) {
    this.repo = repo;
  }

  create(email: string, password: string) {
    //why do we need to create entity instance first
    //it exists in cases where we want to do valiation in the users.entity: create will do validation first
    const user = this.repo.create({ email, password });

    //if we save entity instance all hooks in the users.entity are executed
    return this.repo.save(user);
  }

  findOne(id: number) {
    if(!id) {
      return null;
    }

    return this.repo.findOne(id);
  }

  find(email: string) {
    return this.repo.find({ email });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.repo.remove(user);
  }
}
