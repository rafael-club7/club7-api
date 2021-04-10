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
            { uri: /\/logout/, method: 'post' }
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
            { uri: /\/usuario\/senha/, method: 'post' },
            { uri: /\/usuario\/senha/, method: 'put' },
        ];

        if (!all.find(x => matchExact(x.uri, path) && method.toLowerCase() === x.method)) {
            // TODO: Validar Assinatura
            

            let permissoes = [];
            
            // TODO: Melhorar Permissoes
            
            // ADMIN
            if([ 9 ].includes(usuario.tipo)){
                permissoes = [
                    { uri: /\/usuario/, nethod: 'get' },
                    { uri: /\/usuario\/.*/, nethod: 'get' },
                ];
            }else{
                permissoes = [
                    { uri: /\/usuario\/.*/, nethod: 'get' },
                ];
            }

            if(!permissoes.find(acao => matchExact(acao.uri, path))){
                res.status(401).send({
                    status: 0,
                    errors: [
                        {
                            msg: 'Você não tem permissão para acessar esse método!'
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
