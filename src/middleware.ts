// Middleware

import { Request, Response, NextFunction } from 'express';
import { getAuthUserIdbyToken } from './callApi';
import { User } from './types';

export const blockUnauthorizedRequest = async (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is logged in by checking the token
    if (!req.headers.authorization) {
        // send unauthorized status response
        res.status(401).send();
        return;
    }
    const userId = await getAuthUserIdbyToken(req.headers.authorization || '');
    if (!userId) {
        // send unauthorized status response
        res.status(401).send('Invalid token');
        return;
    }
    else {
        // send ok status response with user data
        next();
    }
}