import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';
import CategoriaEstabelecimentoController from './CategoriaEstabelecimentoController';
import AssinaturaController from './AssinaturaController';
import ServicoController from './ServicoController';
import EstabelecimentoController from './EstabelecimentoController';
import IndicacaoController from './IndicacaoController';
import ServicoResgatadoController from './ServicoResgatadoController';
import CadastroController from './CadastroController';

const routes = Router();

[ 
    UsuarioController, 
    SessaoController, 
    AutorizacaoController, 
    PlanoController, 
    CategoriaEstabelecimentoController,
    AssinaturaController,
    ServicoController,
    EstabelecimentoController,
    IndicacaoController,
    ServicoResgatadoController,
    CadastroController,
].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
