import { Router } from 'express';
import { singleton } from '../tools/singleton.js'
import { scope } from '../middlewares/scope.js';
import { _catch } from '../middlewares/catch.js';
import { ConsumersController } from '../controllers/ConsumersController.js';

const router = Router();

router.get(
    '/consumers',
    scope('consumers:*', 'consumers:read'),
    _catch((req, res) => singleton(ConsumersController).find(req, res))
)

router.put(
    '/consumers',
    scope('conversations:*', 'conversations:write'),
    _catch((req, res) => singleton(ConsumersController).save(req, res))
)

router.post(
    '/consumers/sign-in',
    _catch((req, res) => singleton(ConsumersController).signIn(req, res))
)

router.get(
    '/consumers/:consumerId',
    scope('consumers:*', 'consumers:read', req => req.token.sub === `consumer:${req.params.consumerId}`),
    _catch((req, res) =>
        singleton(ConsumersController).findOne(req, res)
    )
)

router.get(
    '/consumers/:consumerId/conversations',
    scope('conversations:*', 'conversations:read', req => req.token.sub === `consumer:${req.params.consumerId}`),
    _catch((req, res) =>
        singleton(ConsumersController).findConversations(req, res)
    )
)

router.post(
    '/consumers/:consumerId/conversations',
    scope('conversations:*', 'conversations:write', req => req.token.sub === `consumer:${req.params.consumerId}`),
    _catch((req, res) =>
        singleton(ConsumersController).addConversation(req, res)
    )
);

export default router;