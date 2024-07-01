import Express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { singleton } from './tools/singleton.js'
import { _catch } from './middlewares/catch.js'
import { AuthenticationController } from './controllers/AuthenticationController.js'
import cors from 'cors'
import { logger } from './middlewares/logger.js'
import consumerRoutes from './routes/consumers.routes.js'
import conversationsRoutes from './routes/conversations.routes.js'
import usersRoutes from './routes/users.routes.js'
import { errors, isCelebrateError } from 'celebrate'

export const app = Express()

app.use(logger);
app.use(cors());
app.use(Express.json());


app.post(
  '/auth/sign-in',
  _catch((req, res, next) => {
    singleton(AuthenticationController).signIn(req, res).catch(next)
  })
)

app.use(consumerRoutes);
app.use(conversationsRoutes);
app.use(usersRoutes);

app.use((req, res) => {
  res.status(404).send()
})

app.use((err: any, req: Request, res: Response, _: NextFunction) => {
  if (isCelebrateError(err)) {
    const values = err.details.values();

    let { message } = values.next().value.details[0];

    message = message.replace(`"`, ``).replace(`"`, ``);

    return res.status(400).json({
      status: 'error',

      message: message || 'no message',
    });
  }

  if(err.status && err.message) return res.status(err.status).json({
    status: err.status,
    message: err.message,
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

