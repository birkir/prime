import { Arg, Args, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserRepository } from '../repositories/UserRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { UpdateUserInput } from '../types/UpdateUserInput';
import { User } from '../types/User';
import { ExtendedConnection } from '../utils/ExtendedConnection';

const UserConnection = createConnectionType(User);

@Resolver(of => User)
export class UserResolver {
  @InjectRepository(UserRepository)
  private readonly userRepository: UserRepository;

  @Query(returns => User)
  public User(
    @Arg('id', type => ID) id: string //
  ) {
    return this.userRepository.findOneOrFail(id);
  }

  @Query(returns => UserConnection)
  public allUsers(
    @Args() args: ConnectionArgs //
  ) {
    return new ExtendedConnection(args, {
      repository: this.userRepository,
      sortOptions: [{ sort: 'createdAt', order: 'ASC' }],
    });
  }

  @Mutation(returns => User)
  public async updateUser(
    @Arg('id', type => ID) id: string,
    @Arg('input', type => UpdateUserInput) input: UpdateUserInput
  ) {
    const user = await this.userRepository.findOneOrFail(id);
    user.profile = input;
    await this.userRepository.save(user);
    return user;
  }

  @Mutation(returns => Boolean)
  public async removeUser(
    @Arg('id', type => ID) id: string //
  ) {
    const user = await this.userRepository.findOneOrFail(id);
    await this.userRepository.remove(user);
    return true;
  }

  @FieldResolver(returns => [String], { nullable: true })
  public async roles(@Root() user: User): Promise<string[]> {
    // dno... yet
    return [];
  }
}
