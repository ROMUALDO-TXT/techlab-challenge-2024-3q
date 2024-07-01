import { Router, Request, Response, NextFunction } from 'express';
import { singleton } from '../tools/singleton.js'
import { scope } from '../middlewares/scope.js';
import { _catch } from '../middlewares/catch.js';
import { UsersController } from '../controllers/UsersController.js';
import { celebrate, Segments, Joi, CelebrateError, isCelebrateError } from 'celebrate';
import { profiles } from '../constants/profiles.js';

const router = Router();

router.get(
    '/users',
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
    scope('users:*', 'users:read'),
    _catch((req, res) => singleton(UsersController).find(req, res))
)

router.post('/users',
    celebrate({
        [Segments.BODY]: Joi.object({
            username: Joi.string().required().messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'any.required': 'Username is required'
            }),
            email: Joi.string().email().required().messages({
                'string.base': 'Email must be a string',
                'string.email': 'Email must be a valid email address',
                'string.empty': 'Email is required',
                'any.required': 'Email is required'
            }),
            password: Joi.string().required().messages({
                'string.base': 'Password must be a string',
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            }),
            password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
                'string.base': 'Password confirmation must be a string',
                'any.only': 'Passwords do not match',
                'string.empty': 'Password confirmation is required',
                'any.required': 'Password confirmation is required'
            }),
            profile: Joi.string().valid('sudo', 'standard').required().messages({
                'string.base': 'Profile must be a string',
                'any.only': 'Profile must be one of the allowed values',
                'string.empty': 'Profile is required',
                'any.required': 'Profile is required'
            }),
        }),
    }),
    scope('users:*', 'users:write', req => req.body?.id && [`users:${req.body.id}:*`, `users:${req.body.id}:write`]),
    _catch((req, res) => singleton(UsersController).save(req, res))
)

router.put(
    '/users',
    celebrate({
        [Segments.BODY]: Joi.object({
            id: Joi.string().uuid().required(),
            username: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().optional(),
            profile: Joi.string().valid('sudo', 'standard').optional(),
        }),
    }),
    scope('users:*', 'users:write', req => req.body?.id && [`users:${req.body.id}:*`, `users:${req.body.id}:write`]),
    _catch((req, res) => singleton(UsersController).create(req, res))
)

router.get(
    '/users/:userId',
    scope('users:*', 'users:read', req => [`users:${req.params.id}:*`, `users:${req.params.id}:read`]),
    _catch((req, res) =>
        singleton(UsersController).findOne(req, res)
    )
)

router.patch(
    '/users/:userId',
    celebrate({
        [Segments.BODY]: Joi.object({
            username: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().optional(),
            profile: Joi.string().valid('sudo', 'standard').optional(),
        }),
        [Segments.PARAMS]: {
            id: Joi.string().uuid().required(),
        },
    }),
    scope('users:*', 'users:write', req => [`users:${req.params.id}:*`, `users:${req.params.id}:write`]),
    _catch((req, res) =>
        singleton(UsersController).update(req, res)
    )
)

router.delete(
    '/users/:userId',
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().uuid().required(),
        },
    }),
    scope('users:*', 'users:write', req => [`users:${req.params.id}:*`, `users:${req.params.id}:write`]),
    _catch((req, res) =>
        singleton(UsersController).save(req, res)
    )
)

export default router;