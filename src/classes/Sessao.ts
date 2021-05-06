import Classes from '../System/Classes';
import Util from '../System/Util';
import { NextFunction, Request, Response } from 'express';
import Usuario, { IUsuario } from './Usuario';

export interface ISessao
{
    id: string;
    usuario: string;
    data_inicio: string;
    ultima_data: string;
}

interface DataResponse {
    status: number;
    msg: string;
    data?: { [k: string] : any };
}

class Sessao extends Classes {
    static table = 'sessao';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: false },
        { name: 'data_inicio', type: 'string', required: false },
        { name: 'ultima_data', type: 'string', required: false }
    ];
    
    static async Verificar (sid : string) : Promise<DataResponse> {
        const sessao = <ISessao>(await this.GetFirst(`id = '${sid}'`));

        const resp = {
            status: 0,
            msg: '',
            data: sessao,
            id: sid
        };

        if (!sessao) {
            resp.msg = 'Sessão não encontrada';
            return resp;
        }

        if (new Date(sessao.ultima_data) < new Date(Util.HoursAgo(5) * 1000)) {
            resp.msg = 'Sessão expirada';
            return resp;
        }

        return {
            ...resp,
            status: 1,
            msg: 'Sessão válida'
        };
    }

    static async ValidarPermissao (req : Request, res : Response, next : NextFunction) : Promise<void> {
        const { headers, path, method } = req;

        function matchExact (r: RegExp, str: string) {
            const match = str.match(r);
            return match && str === match[0];
        }

        const open = [
            { uri: /\/usuario/, method: 'post' },
            { uri: /\/login/, method: 'post' },
            { uri: /\/logout/, method: 'post' },
            { uri: /\/confirmar-email/, method: 'post' },
        ];

        // Não precisa de sessão
        if (open.find(x => matchExact(x.uri, path) && method.toLowerCase() === x.method)) {
            return next();
        }

        if (headers['authorization'] === undefined) {
            res.status(403).send({
                status: 0,
                errors: [
                    { msg: 'O header "authorization" é obrigatório!' }
                ]
            });
            return;
        }

        const sessao = await Sessao.Verificar(headers.authorization);
        if (sessao.status !== 1) {
            res.status(403).send({
                status: 0,
                errors: [
                    { msg: sessao.msg }
                ]
            });
            return;
        }

        const usuario = <IUsuario>(await Usuario.GetFirst(`id = '${sessao.data.usuario}'`));
        if (usuario === null) {
            res.status(403).send({
                status: 0,
                errors: [
                    { msg: 'Usuário não encontrado' }
                ]
            });
            return;
        }

        // Não precisa de permissao
        const all = [
            { uri: /\/sessao/, method: 'get' },
            { uri: /\/nova-senha/, method: 'post' },
            { uri: /\/nova-senha/, method: 'put' },
        ];

        if (!all.find(x => matchExact(x.uri, path) && method.toLowerCase() === x.method)) {
            // TODO: Validar Assinatura
            

                       
            // TODO: Melhorar Permissoes
            
            let permissoes = [
                // Usuario
                { uri: /\/usuario/, method: 'get' },
                { uri: /\/usuario\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                { uri: /\/usuario\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                { uri: /\/usuario\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                
                // Plano
                { uri: /\/plano/, method: 'get' },
                { uri: /\/plano\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                
                // Categoria Estabelecimento
                { uri: /\/categoria-estabelecimento/, method: 'get' },
                { uri: /\/categoria-estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                
                // Estabelecimento
                { uri: /\/estabelecimento/, method: 'get' },
                { uri: /\/estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },

                // Assinatura
                { uri: /\/assinatura/, method: 'post' },
                { uri: /\/assinatura\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                { uri: /\/assinatura\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                { uri: /\/assinatura\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                
                // Serviço
                { uri: /\/servico/, method: 'get' },
                { uri: /\/servico\/estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                { uri: /\/servico\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                
                // Detalhe do Estabelecimento
                { uri: /\/estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
                
                // Indicações
                { uri: /\/indicacoes/, method: 'get' },
                
                // Serviço Resgatado
                { uri: /\/servico-resgatado/, method: 'post' },
                { uri: /\/servico-resgatado/, method: 'get' },
                { uri: /\/servico-resgatado\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'get' },
            ];
            
            // Estabelecimento
            if([ 9, 2 ].includes(usuario.tipo)){
                permissoes = [
                    ...permissoes,
                    
                    // Estabelecimento
                    { uri: /\/estabelecimento/, method: 'post' },
                    { uri: /\/estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                    { uri: /\/estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                    
                    // Serviço
                    { uri: /\/servico/, method: 'post' },
                    { uri: /\/servico\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                    { uri: /\/servico\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                    
                    
                    // Serviço Resgatado
                    { uri: /\/servico-resgatado\/[0-9A-Z]+/, method: 'post' },
                    { uri: /\/servico-resgatado\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                ];
            }
            
            
            // ADMIN
            if(usuario.tipo === 9){
                permissoes = [
                    ...permissoes,
                    
                    // Usuario
                    { uri: /\/usuario/, method: 'get' },
                    
                    // Plano
                    { uri: /\/plano/, method: 'post' },
                    { uri: /\/plano\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                    { uri: /\/plano\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                    
                    // Categoria Estabelecimento
                    { uri: /\/categoria-estabelecimento/, method: 'post' },
                    { uri: /\/categoria-estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'put' },
                    { uri: /\/categoria-estabelecimento\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?/, method: 'delete' },
                    
                    // Assinatura
                    { uri: /\/assinatura/, method: 'get' },
                ];
            }
            
            if(!permissoes.find(x => matchExact(x.uri, path) && method.toLowerCase() === x.method)){
                res.status(404).send({
                    status: 0,
                    errors: [
                        {
                            msg: 'Método não encontrado!'
                        }
                    ]
                });
                return;
            }

            
        }

        req.sessao = sessao;
        req.usuario = usuario;
        next();
    }

}

export default Sessao;
