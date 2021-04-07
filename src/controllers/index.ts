import { Router } from 'express';

import UsuarioController from './UsuarioController';

const routes = Router();

[ UsuarioController ].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
