import * as express from 'express';
import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';
import { omit } from 'lodash';
import { User } from '../../models/User';

export const auth = express();

const strategy = new LocalStrategy(
  { usernameField: 'email' },
  (username: string, password: string, done: Function) => {
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

passport.serializeUser((user: User, done: Function) => {
	return done(null, { id: user.id });
})

passport.deserializeUser(({ id }: { id: string; }, done: Function) => {
  return User.findOne({ where: { id } })
  .then(user => done(null, user))
  .catch(err => done(null, err.message));
});

passport.use(strategy);

auth.get('/user', (req, res) => {
  const user = (req as any).user;
  const success = Boolean(user);
  res.json({
    user: success ? omit(user.dataValues || {}, ['password']) : null,
    success,
  });
});

auth.post('/login', passport.authenticate('local'), async (req, res) => {
  const user = (req as any).user;
  const success = Boolean(user);
  res.json({
    user: success ? omit(user.dataValues || {}, ['password']) : null,
    success,
  });
});

auth.get('/logout', (req, res) => {
  const { user, session } = (req as any);
	if (user) {
		session.destroy()
		res.clearCookie('prime.sid');
	}
	return res.json({ success: true });
});
