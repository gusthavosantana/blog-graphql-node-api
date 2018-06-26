import * as graphqlfields from 'graphql-fields';
import { Transaction } from "sequelize";

import { DBConnection } from "../../../interfaces/DBConnectionInterface";
import { PostInstance } from "../../../models/PostModel";
import { handleError, throwError } from "../../../utils/utils";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolvers";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {

    Post: {

        author: (parent, args, {db, dataloaders: {userLoader}}: {db: DBConnection, dataloaders: DataLoaders}, info) => {
            return userLoader
                .load({key: parent.get('author'), info})
                .catch(handleError);
        },

        comments: (parent, {first = 10, offset = 0}, context: ResolverContext, info) => {

            return context.db.Comment.findAll({
                where: { post: parent.get('id')},
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
            .catch(handleError);
        }
    },

    Query: {

        posts: (parent, {first = 10, offset = 0}, context: ResolverContext, info) => {
            return context.db.Post
                .findAll({
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
                })
                .catch(handleError);
        },

        post: (parent, {id}, context: ResolverContext, info) => {
            id = parseInt(id);
            
            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments']})
                })
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found.`);
                    return post;
                })
                .catch(handleError);
        }
    },

    Mutation: {

        createPost: compose(...authResolvers)((parent, { input }, {db, authUser} : {db:DBConnection, authUser: AuthUser}, info) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post.create(input, {transaction: t});
            })
            .catch(handleError);
        }),

        updatePost: compose(...authResolvers)((parent, { id, input }, {db, authUser} : {db:DBConnection, authUser: AuthUser}, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then(post => {
                        throwError(!post, `Post with id ${id} not found.`);
                        throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts by yourself`);
                        input.author = authUser.id;
                        return post.update(input, {transaction: t});
                    })
            })
            .catch(handleError);
        }),

        deletePost: compose(...authResolvers)((parent, { id },  {db, authUser} : {db:DBConnection, authUser: AuthUser}, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then(post => {
                        throwError(!post, `Post with id ${id} not found.`);
                        throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts by yourself`);
                        return post.destroy({transaction: t})
                            .then(post => !!post);
                    })
            })
            .catch(handleError);
        })
    }
}