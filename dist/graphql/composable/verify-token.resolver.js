"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const utils_1 = require("../../utils/utils");
exports.verifyTokenResolver = (resolver) => {
    return (parent, args, context, info) => {
        const token = context.authorization ? context.authorization.split(' ')[1] : undefined;
        jwt.verify(token, utils_1.JWT_SECRET, (err, payload) => {
            if (err) {
                throw new Error(`${err.name}: ${err.message}`);
            }
            return resolver(parent, args, context, info);
        });
    };
};
