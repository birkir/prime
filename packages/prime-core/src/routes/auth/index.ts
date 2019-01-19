import * as express from 'express';
import { omit } from 'lodash';
import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';
import { acl } from '../../acl';
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
  (username: string, password: string, done: (a, b, c?) => void) => {
    User.findOne({
      where: {
        email: username,
      },
    }).then(user => {
      if (user && user.isPasswordMatch(password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Wrong email or password' });
      }
    });
  }
);

passport.serializeUser((user: User, done: (a: any, b: any) => void) => {
  return done(null, { id: user.id });
});

passport.deserializeUser(({ id }: { id: string }, done: (a: any, b: any) => void) => {
  return User.findOne({ where: { id } })
    .then(user => done(null, user))
    .catch(err => done(null, err.message));
});

passport.use(strategy);

auth.get('/user', async (req: IRequest, res) => {
  const setup = (await User.count()) === 0;
  const user = req.user;
  const success = Boolean(user);

  const cookie = String(req.headers.cookie);
  const cookies = new Map(cookie.split(';').map(n => n.trim().split('=')) as any);

  res.json({
    user: success ? omit((user && user.dataValues) || {}, ['password']) : null,
    setup,
    versionId: cookies.get('prime.versionId'),
    success,
  });
});

const login = async (req: IRequest, res) => {
  const user = req.user;
  const success = Boolean(user);
  res.json({
    user: success ? omit((user && user.dataValues) || {}, ['password']) : null,
    success,
  });
};

auth.post('/login', passport.authenticate('local'), login);

auth.post(
  '/register',
  async (req: IRequest, res, next) => {
    const setup = (await User.count()) === 0;

    if (setup) {
      const user = await User.create({
        firstname: req.body.firstname || '',
        lastname: req.body.lastname || '',
        email: req.body.email,
        password: req.body.password,
      });
      if (user) {
        await acl.addUserRoles(user.id, ['admin']);
      }
    }

    next();
  },
  passport.authenticate('local'),
  login
);

auth.get('/preview', (req: IRequest, res) => {
  const { user } = req;
  if (!user) {
    return res.json({ success: false });
  }

  const [url] = Object.keys(req.query) || [null];

  if (url) {
    const versionId = url.substr(url.indexOf('?') + 1);
    if (versionId.length === 36) {
      res.cookie('prime.versionId', versionId.toLowerCase(), { path: '/', maxAge: 86400000 });
      res.redirect(303, url.toLowerCase().replace('?', '?versionId='));
      return;
    }
  }

  res.clearCookie('prime.versionId');
  res.json({ success: false });
});

auth.get('/logout', (req: IRequest, res) => {
  const { user, session } = req;

  if (user) {
    session.destroy();
    res.clearCookie('prime.sid');
  }

  return res.json({ success: true });
});
