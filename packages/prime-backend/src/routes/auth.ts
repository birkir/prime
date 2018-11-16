import * as express from 'express';
import { User } from '../models/User';

export const auth = express();

auth.post('/', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (user && user.isPasswordMatch(req.body.password)) {
      const { password, ...rest } = user.dataValues;
      res.status(200).json(rest);
    } else {
      res.status(401).json({ error: 'Wrong email or password' });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});