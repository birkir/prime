import { AccountsModule } from '@accounts/graphql-api';
import AccountsPassword from '@accounts/password';
import { UserEmail } from '@accounts/typeorm';
import { ForbiddenError } from '@casl/ability';
import GraphQLJSON from 'graphql-type-json';
import { Arg, Args, Ctx, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { User } from '../../../entities/User';
import { UserMeta } from '../../../entities/UserMeta';
import { Context } from '../../../interfaces/Context';
import { processWebhooks } from '../../../utils/processWebhooks';
import { UserMetaRepository } from '../repositories/UserMetaRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ConnectionArgs, createConnectionType } from '../types/createConnectionType';
import { UpdateUserInput } from '../types/UpdateUserInput';
import { Authorized } from '../utils/Authorized';
import { ExtendedConnection } from '../utils/ExtendedConnection';

const UserConnection = createConnectionType(User);

@Resolver(of => User)
export class UserResolver {
  @InjectRepository(UserRepository)
  private readonly userRepository: UserRepository;

  @InjectRepository(UserMetaRepository)
  private readonly userMetaRepository: UserMetaRepository;

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
  @Query(returns => User)
  public async getUser(@Ctx() context: Context) {
    const user = await this.userRepository.findOneOrFail(context.user.id);
    const meta = await user.meta();
    return {
      ...context.user,
      meta,
      ability: context.ability.rules,
    };
  }

  @Authorized(role => role.can('list', 'User'))
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
      const meta = await user.meta();
      return {
        ...user,
        meta,
      };
    };
    return result;
  }

  @Authorized(role => role.can('create', 'User'))
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
      const meta = new UserMeta();
      meta.id = userId;
      meta.profile = profile;
      await this.userMetaRepository.save(meta);
    }

    processWebhooks('user.created', { userId });

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
      processWebhooks('user.emailAdded', { userId: user.id, email });
      return true;
    }
    return false;
  }

  @Mutation(returns => User)
  public async updateUser(
    @Arg('id', type => ID) id: string,
    @Arg('input', type => UpdateUserInput) input: UpdateUserInput,
    @Ctx() context: Context
  ) {
    const user = await this.userRepository.findOneOrFail(id);
    const meta = await user.meta();
    meta.profile = input.profile;
    ForbiddenError.from(context.ability).throwUnlessCan('update', user);
    await this.userRepository.save(user);
    await this.userMetaRepository.save(meta);
    processWebhooks('user.updated', { user });
    return user;
  }

  @Authorized()
  @Mutation(returns => Boolean)
  public async removeUser(
    @Arg('id', type => ID) id: string, //
    @Ctx() context: Context
  ) {
    const user = await this.userRepository.findOneOrFail(id);
    ForbiddenError.from(context.ability).throwUnlessCan('delete', user);
    await this.userRepository.remove(user);
    processWebhooks('user.removed', { user });
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

  @FieldResolver(returns => GraphQLJSON, { nullable: true })
  public ability(@Ctx() context: Context) {
    return context.ability.rules;
  }

  @FieldResolver(returns => UserMeta)
  public async meta(@Root() user: User): Promise<UserMeta> {
    return user.meta();
  }
}
