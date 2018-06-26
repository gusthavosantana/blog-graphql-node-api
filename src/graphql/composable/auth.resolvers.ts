import { authResolver } from './auth.resolver';
import { verifyTokenResolver } from './verify-token.resolver';

export const authResolvers = [
    authResolver,
    verifyTokenResolver
]