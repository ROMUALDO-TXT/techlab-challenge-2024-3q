import { Router } from 'express';
import { singleton } from '../tools/singleton.js'
import { scope } from '../middlewares/scope.js';
import { _catch } from '../middlewares/catch.js';
import { ConversationsController } from '../controllers/ConversationsController.js';
import { celebrate, Segments, Joi } from 'celebrate';

const router = Router();

router.get(
    '/conversations',
    celebrate({
        [Segments.QUERY]: Joi.object().keys({
            skip: Joi.number().integer().min(0).default(0).messages({
                'number.base': `"skip" should be a number`,
                'number.integer': `"skip" should be an integer`,
                'number.min': `"skip" should be a positive integer`,
            }),
            take: Joi.number().integer().min(1).default(25).messages({
                'number.base': `"take" should be a number`,
                'number.integer': `"take" should be an integer`,
                'number.min': `"take" should be at least 1`,
            }),
        })
    }),
    scope('conversations:*', 'conversations:read'),
    _catch((req, res) => singleton(ConversationsController).find(req, res))
)

router.get(
    '/conversations/:conversationId',
    scope('conversations:*', 'conversations:read', req => [`conversations:${req.params.id}:*`, `conversations:${req.params.id}:read`], req => req.token.sub.startsWith('consumer:')),
    _catch((req, res) => singleton(ConversationsController).findOne(req, res))
)

router.delete(
    '/conversations/:conversationId',
    scope('conversations:*', 'conversations:write', req => [`conversations:${req.params.id}:*`, `conversations:${req.params.id}:write`], req => req.token.sub.startsWith('consumer:')),
    _catch((req, res) => singleton(ConversationsController).delete(req, res))
)

router.get(
    '/conversations/:conversationId/messages',
    scope('conversations:*', 'conversations:read', req => [`conversations:${req.params.id}:*`, `conversations:${req.params.id}:read`], req => req.token.sub.startsWith('consumer:')),
    _catch((req, res) => singleton(ConversationsController).findMessages(req, res))
)

router.post(
    '/conversations/:conversationId/messages',
    scope('conversations:*', 'conversations:write', req => [`conversations:${req.params.id}:*`, `conversations:${req.params.id}:write`], req => req.token.sub.startsWith('consumer:')),
    _catch((req, res) => singleton(ConversationsController).addMessage(req, res))
)

export default router;