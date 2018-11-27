import * as express from 'express';
import { omit } from 'lodash';
import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';
import { User } from '../../models/User';

interface IRequest extends express.Request {
  user?: {
    dataValues: object;
  };
  session: {
    [key: string]: object;
    destroy(): void;
  };
}

// tslint:disable-next-line export-name
export const auth = express();

const strategy = new LocalStrategy(
  { usernameField: 'email' },
  (username: string, password: string, done: Function) => {
    User.findOne({
      where: {
        email: username
      }
    }).then(user => {
      if (user && user.isPasswordMatch(password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Wrong email or password' });
      }
    });
  }
);

passport.serializeUser((user: User, done: Function) => {
  return done(null, { id: user.id });
});

passport.deserializeUser(({ id }: { id: string }, done: Function) => {
  return User
    .findOne({ where: { id } })
    .then(user => done(null, user))
    .catch(err => done(null, err.message));
});

passport.use(strategy);

auth.get('/user', (req: IRequest, res) => {
  const user = req.user;
  const success = Boolean(user);
  res.json({
    user: success ? omit(user && user.dataValues || {}, ['password']) : null,
    success
  });
});

auth.post('/login', passport.authenticate('local'), async (req: IRequest, res) => {
    const user = req.user;
    const success = Boolean(user);
    res.json({
      user: success ? omit(user && user.dataValues || {}, ['password']) : null,
      success
    });
  }
);

auth.get('/logout', (req: IRequest, res) => {
  const { user, session } = req;

  if (user) {
    session.destroy();
    res.clearCookie('prime.sid');
  }

  return res.json({ success: true });
});
