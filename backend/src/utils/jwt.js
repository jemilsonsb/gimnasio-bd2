import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';

export function crearToken(payload) {
  return jwt.sign(payload, environment.jwt.secret, {
    expiresIn: environment.jwt.expiresIn
  });
}

export function verificarToken(token) {
  return jwt.verify(token, environment.jwt.secret);
}
