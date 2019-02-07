import { AccountsModule } from '@accounts/graphql-api';
import AccountsPassword from '@accounts/password';
import { UserEmail } from '@accounts/typeorm';
import GraphQLJSON from 'graphql-type-json';
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Context } from '../../../interfaces/Context';
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

  @InjectRepository(UserEmail)
  private readonly userEmailRepository: Repository<UserEmail>;

  @Authorized()
  @Query(returns => User)
  public User(
    @Arg('id', type => ID) id: string //
  ) {
    return this.userRepository.findOneOrFail(id);
  }

  @Authorized()
  @Query(returns => UserConnection)
  public allUsers(
    @Args() args: ConnectionArgs //
  ) {
    const result = new ExtendedConnection(args, {
      repository: this.userRepository,
      sortOptions: [{ sort: 'createdAt', order: 'ASC' }],
    });
    (result as any).resolveNode = async user => {
      user.emails = await this.userEmailRepository.find({ user });
      return user;
    };
    return result;
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async createPrimeUser(
    @Arg('email') email: string,
    @Arg('password', { nullable: true }) maybePassword: string,
    @Arg('profile', type => GraphQLJSON, { nullable: true }) profile: any
  ) {
    const password = AccountsModule.injector.get(AccountsPassword);

    const userId = await password.createUser({
      email,
      password: maybePassword,
    });

    if (!maybePassword) {
      password.sendEnrollmentEmail(email);
    }

    await password.server.activateUser(userId);

    if (profile) {
      await password.server.setProfile(userId, profile);
    }

    return true;
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async changeEmail(
    @Arg('password') password: string,
    @Arg('email') email: string,
    @Ctx() context: Context
  ): Promise<boolean> {
    const accounts = AccountsModule.injector.get(AccountsPassword);
    const user = await accounts.authenticate({
      user: {
        id: context.user.id,
      },
      password,
    });
    if (user) {
      await accounts.addEmail(user.id, email, false);
      await accounts.sendVerificationEmail(email);
      return true;
    }
    return false;
  }

  @Authorized()
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

  @Authorized()
  @Mutation(returns => Boolean)
  public async removeUser(
    @Arg('id', type => ID) id: string //
  ) {
    const user = await this.userRepository.findOneOrFail(id);
    await this.userRepository.remove(user);
    return true;
  }

  @FieldResolver(returns => String, { nullable: true })
  public async email(@Root() user: User): Promise<string> {
    const email = await this.userEmailRepository.findOneOrFail({ user });
    return email.address;
  }

  @FieldResolver(returns => [String], { nullable: true })
  public async roles(@Root() user: User): Promise<string[]> {
    // dno... yet
    return [];
  }
}
