import { Router } from 'express';

import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PerfilController from './PerfilController';

const routes = Router();

[ UsuarioController, SessaoController, PerfilController ].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
