import { Transaction } from "sequelize";

import { DBConnection } from "../../../interfaces/DBConnectionInterface";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolvers";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const commentResolvers = {

    Comment: {

        user: (parent, args, {db, dataloaders: {userLoader}}: {db: DBConnection, dataloaders: DataLoaders}, info) => {
            
            return userLoader
                .load({key: parent.get('user'), info})
                .catch(handleError);
        },
        post: (parent, args, {db, dataloaders: {postLoader}}: {db: DBConnection, dataloaders: DataLoaders}, info) => {
            
            return postLoader
                .load({key: parent.get('post'), info})
                .catch(handleError);
        }
    },

    Query: {
        commentsByPost: (parent, {postId, first = 0, offset = 0}, context: ResolverContext, info) => {
            postId = parseInt(postId);

            return context.db.Comment.findAll({
                where: { post: postId },
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
            .catch(handleError);
        }
    },

    Mutation: {

        createComment: compose(...authResolvers)((parent, { input }, {db, authUser}: {db: DBConnection, authUser: AuthUser}, info) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment.create(input, {transaction: t});
            })
            .catch(handleError);;
        }),
        updateComment: compose(...authResolvers)((parent, { id, input }, {db, authUser}: {db: DBConnection, authUser: AuthUser}, info) => {
            id = parseInt(id);
            
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then(comment => {
                        throwError(!comment, `Comment with id ${id} not found.`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself`);
                        return comment.update(input, {transaction: t});
                    })
            })
            .catch(handleError);;
        }),
        deleteComment: compose(...authResolvers)((parent, { id }, {db, authUser}: {db: DBConnection, authUser: AuthUser}, info) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then(comment => {
                        throwError(!comment, `Comment with id ${id} not found.`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself`);
                        return comment.destroy({transaction: t})
                            .then(comment => !!comment);
                    })
            })
            .catch(handleError);;
        })
    }
}