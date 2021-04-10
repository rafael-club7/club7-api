import express from 'express';
import cors from 'cors';

import routes from './controllers';
import Sessao from './Classes/Sessao';

class App {
    public express: express.Application;

    public constructor () {
        this.express = express();
        this.middlewares();
        this.routes();
    }

    private middlewares (): void {
        this.express.use(express.json());
        this.express.use(cors());
        this.express.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Access-Control-Expose-Headers', '*');
            next();
        });

        this.express.use(Sessao.ValidarPermissao);
    }

    private routes (): void {
        this.express.use(routes);
    }
}

export default new App().express;
