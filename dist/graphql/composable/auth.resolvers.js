"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_resolver_1 = require("./auth.resolver");
const verify_token_resolver_1 = require("./verify-token.resolver");
exports.authResolvers = [
    auth_resolver_1.authResolver,
    verify_token_resolver_1.verifyTokenResolver
];
