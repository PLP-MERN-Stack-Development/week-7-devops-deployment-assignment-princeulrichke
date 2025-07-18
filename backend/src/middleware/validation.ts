import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateGroup = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
    isPrivate: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateMessage = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    messageType: Joi.string().valid('text', 'image', 'file').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};
