import { Router } from 'express';

import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';

const routes = Router();

[ UsuarioController, SessaoController ].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
