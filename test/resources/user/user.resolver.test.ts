import * as jwt from 'jsonwebtoken';

import { app, db, handleError, expect, chai } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';

describe("User", () => {

    let userId: number;
    let token: string;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@email.com',
                    password: '1234'
                },
                {
                    name: 'Gamora',
                    email: 'gamora@email.com',
                    password: '1234'
                },
                {
                    name: 'Groot',
                    email: 'groot@email.com',
                    password: '1234'
                }
            ]))
            .then((users: UserInstance[]) => {
                userId = users[0].get('id');
                const payload = { sub: userId };
                token = jwt.sign(payload, JWT_SECRET);
            });
    });

    describe("Queries", () => {
    
        describe("application/json", () => {
    
            describe("users", () => {
                
                it('should return a list of users', () => {

                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {                            
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array');
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email']);
                        }).catch(handleError);
                });

                it('should paginate a list of users', () => {

                    let body = {
                        query: `
                            query getUsers($first: Int, $offset: Int) {
                                users(first: $first, offset: $offset) {
                                    name
                                    email
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {                            
                            const userList = res.body.data.users;
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array').of.length(2);
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email', 'createdAt']);
                        }).catch(handleError);
                });
            });

            describe("user", () => {

                it('should return a single user', () => {

                    let body = {
                        query: `
                            query getUser($id: ID!) {
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {                            
                            const user = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(user).to.be.an('object');
                            expect(user).to.have.keys(['id', 'name', 'email', 'posts']);
                            expect(user.name).to.equal('Peter Quill');
                            expect(user.email).to.equal('peter@email.com');
                        }).catch(handleError);
                });

                it('should return only name attribute', () => {

                    let body = {
                        query: `
                            query getUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {                            
                            const user = res.body.data.user;
                            expect(res.body.data).to.be.an('object');
                            expect(user).to.be.an('object');
                            expect(user).to.have.key('name');
                            expect(user.name).to.equal('Peter Quill');
                            expect(user.email).to.be.undefined;
                            expect(user.createdAt).to.be.undefined;
                            expect(user.posts).to.be.undefined;
                        }).catch(handleError);
                });

                it('should return user not existent', () => {

                    let body = {
                        query: `
                            query getUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {                            
                            expect(res.body.data.user).to.be.null;
                            expect(res.body).to.have.keys(['data', 'errors'])
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found.');
                        }).catch(handleError);
                });
            });
        });
    });

    describe("Mutations", () => {
        describe("application/json", () => {
            describe("createUser", () => {

                it("should create a new user", () => {

                    let body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: "Drax",
                                email: "drax@email.com",
                                password: "1234"
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdUser = res.body.data.createUser;

                            expect(createdUser).to.be.an('object');
                            expect(createdUser.name).to.equal('Drax');
                            expect(createdUser.email).to.equal('drax@email.com');
                            expect(parseInt(createdUser.id)).to.be.a('number');

                        }).catch(handleError);
                });
            });

            describe("updateUser", () => {

                it("should update a user", () => {

                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: "Star Lord",
                                email: "peter@email.com",
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data).to.have.key('updateUser');
                            expect(res.body.data.updateUser).to.be.null;                           

                        }).catch(handleError);
                });
        
            });
        });
    });
});
