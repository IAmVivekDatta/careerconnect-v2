import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';
import fetch from 'node-fetch';

const createToken = (id: string) =>
  // jwt types are strict; cast secret and options to avoid overload mismatch in this codebase
  jwt.sign({ id }, env.JWT_SECRET as unknown as jwt.Secret, {
    // expiresIn can be string like '1d'
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions);

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: true, message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password, role });
  const token = createToken(String((user as any)._id));

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: true, message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: true, message: 'Invalid credentials' });
  }

  const token = createToken(String((user as any)._id));

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    }
  });
};

export const logout = (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
};

export const googleSignIn = async (req: Request, res: Response) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: true, message: 'Missing id_token' });

  try {
    // Verify the token with Google's tokeninfo endpoint
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`);
    if (!resp.ok) return res.status(401).json({ error: true, message: 'Invalid Google token' });
    const info = await resp.json();

    // info contains email, name, picture, sub
    const email = info.email;
    if (!email) return res.status(400).json({ error: true, message: 'Google token missing email' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: info.name ?? 'Google User', email, password: Math.random().toString(36).slice(2) });
    }

    const token = createToken(String((user as any)._id));

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: info.picture ?? user.profilePicture } });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Google sign-in failed', details: err.message });
  }
};
