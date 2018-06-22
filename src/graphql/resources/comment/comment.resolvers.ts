import { DBConnection } from "../../../interfaces/DBConnectionInterface";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";

export const commentResolvers = {

    Comment: {

        user: (parent, args, {db}: {db: DBConnection}, info) => {
            
            return db.User
                .findById(parent.get('user'))
                .catch(handleError);
        },
        post: (parent, args, {db}: {db: DBConnection}, info) => {

            return db.Post
                .findById(parent.get('post'))
                .catch(handleError);;
        }
    },

    Query: {
        commentsByPost: (parent, {postId, first = 0, offset = 0}, {db}: {db: DBConnection}, info) => {
            postId = parseInt(postId);

            return db.Comment.findAll({
                where: { post: postId },
                limit: first,
                offset: offset
            })
            .catch(handleError);;
        }
    },

    Mutation: {

        createComment: (parent, { input }, {db}: {db: DBConnection}, info) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment.create(input, {transaction: t});
            })
            .catch(handleError);;
        },
        updateComment: (parent, { id, input }, {db}: {db: DBConnection}, info) => {
            id = parseInt(id);
            
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then(comment => {
                        if(!comment) throw new Error(`Comment with id ${id} not found.`);
                        return comment.update(input, {transaction: t});
                    })
            })
            .catch(handleError);;
        },
        deleteComment: (parent, { id }, {db}: {db: DBConnection}, info) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then(comment => {
                        if(!comment) throw new Error(`Comment with id ${id} not found.`);
                        return comment.destroy({transaction: t})
                            .then(comment => !!comment);
                    })
            })
            .catch(handleError);;
        }
    }
}