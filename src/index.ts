import * as http from 'http';
import app from './app';
import { normalize } from 'path';
import { normalizePort, onListening, onError } from './utils';
import db from './models';

const server = http.createServer(app);
const port = normalizePort(process.env.port || 3000);

db.sequelize.sync()
    .then(() => {

        server.listen(port);
        server.on('listening', onListening(server));
        server.on('error', onError(server));

    });
