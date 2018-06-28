import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import schema from './graphql/schema';
import db from './models';
import { extractJwtMiddleware } from './middlewares/extract-jwt-middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';

class App {
    
    public express: express.Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {
        this.express = express();
        this.init();
    }

    private init() {
        this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
        this.requestedFields = new RequestedFields();
        this.middlware();
    }

    private middlware(): void {

        this.express.use('/graphql', 

            extractJwtMiddleware(),

            (req, res, next) => {
                req['context']['db'] = db;
                req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
                next();
            },

            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: process.env.NODE_ENV === 'development',
                context: req['context']
            }))
        );
    }
}

export default new App().express;