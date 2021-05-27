import Util from '../System/Util';
import Classes from '../System/Classes';
import Assinatura, { IAssinatura } from './Assinatura';
import Pagamento, { IPagamento } from './Pagamento';
import CategoriaParceiro from './CategoriaParceiro';
import DB from '../System/DB';

export interface IUsuario {
    id: string;
    nome: string;
    nome_normalizado: string;
    email: string;
    senha: string;
    cpf?: string;
    celular?: string;
    data_criacao: string;
    indicado?: string;
    tipo: number;
    mudar_senha?: number;
    confirmacao_email?: number;
    status: string | number;

    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
    latitude?: string;
    longitude?: string;
    
    // Parceiro
    descricao?: string;
    cnpj?: string;
    imagem?: string;
    categoria?: string;
    tem_wifi?: number;
    wifi_nome?: string;
    wifi_senha?: string;
    tem_banheiro?: number;
    tem_local_descanso?: number;
    tem_local_carregar_celular?: number;
}

class Usuario extends Classes {
    static table = 'usuario';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'celular', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'senha', type: 'string', required: true },
        { name: 'cpf', type: 'string', required: false },
        { name: 'tipo', type: 'number', required: true },
        { name: 'mudar_senha', type: 'number', required: false },
        { name: 'confirmacao_email', type: 'number', required: false },
        { name: 'indicado', type: 'string', required: false },
        { name: 'data_criacao', type: 'string', required: false },
        { name: 'rua', type: 'string', required: false },
        { name: 'numero', type: 'string', required: false },
        { name: 'bairro', type: 'string', required: false },
        { name: 'cidade', type: 'string', required: false },
        { name: 'estado', type: 'string', required: false },
        { name: 'cep', type: 'string', required: false },
        { name: 'complemento', type: 'string', required: false },

        // info  de Parceiro
        { name: 'descricao', type: 'string', required: false },
        { name: 'cnpj', type: 'string', required: false },
        { name: 'imagem', type: 'string', required: false },
        
        { name: 'categoria', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

    static async Validate (data: { [k: string]: any }): Promise<{ msg: string; }[]> {
        const errors = [];

        for (const field of this.fields) {

            if ((typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && field.required) {
                errors.push({
                    msg: `Campo '${field.name}' é obrigatório!`
                });
            }

            if (!(typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && typeof data[field.name] !== field.type) {
                errors.push({
                    msg: `Campo '${field.name}' precisa ser do tipo '${field.type}'!`
                });
            }
        }

        if (data.tipo === 1) {
            if (typeof data['cpf'] === 'undefined') {
                errors.push({
                    msg: `O campo "CPF" é obrigatório!`
                });
            } else {
                if (!Util.validaCpf(data.cpf)) {
                    errors.push({
                        msg: "CPF inválido!"
                    });
                }
            }
        }

        if (data.tipo === 2) {
            if (typeof data['cnpj'] === 'undefined') {
                errors.push({
                    msg: `O campo "cnpj" é obrigatório!`
                });
            }else if (!Util.validarCNPJ(data.cnpj)) {
                errors.push({
                    msg: "CNPJ inválido!"
                });
            }

            if (typeof data['categoria'] === 'undefined') {
                errors.push({
                    msg: `O campo "Categoria" é obrigatório!`
                });
            }else{
                const categoriaExiste = await CategoriaParceiro.GetFirst(`id = '${data.categoria}'`);
                if(categoriaExiste === null){
                    errors.push({
                        msg: "Categoria não encontrada!"
                    });
                }
            }
        }

        return errors;
    }

    static async hasPlanoAtivo (usuario: string): Promise<boolean> {
        const assinatura = <IAssinatura>(await Assinatura.GetFirst(`usuario = '${usuario}' AND status = 1`, 'data_inicio desc'));

        if (assinatura === null)
            return false;

        const hoje = new Date();
        const dia_contratacao = new Date(assinatura.data_inicio);

        assinatura.valor = parseFloat(assinatura.valor.toString()).toFixed(2);
        assinatura.valor_centavos = Number((parseFloat(assinatura.valor).toFixed(2)).toString().replace(/\./g, ''));

        const pagamentos = <IPagamento[]>(await Pagamento.Get(`assinatura = '${assinatura.id}'`, 'data DESC'));

        if (hoje.getDate() >= dia_contratacao.getDate()) {
            // Verificar o desse mês
            const pagamentosMes = pagamentos.filter(x => new Date(x.data).getMonth() === hoje.getMonth());
            if (pagamentosMes.find(pagamento => pagamento.status === '1')) {
                // PAGO
                return true;
            } else {
                return false;
            }
        } else {
            // Verificar mês passado
            const mesPassado = (new Date()).setMonth(hoje.getMonth() - 1);
            const pagamentosMesPassado = pagamentos.filter(x => new Date(x.data).getMonth() === new Date(mesPassado).getMonth());

            if (pagamentosMesPassado.find(pagamento => pagamento.status === '1')) {
                // PAGO
                return true;
            } else {
                // Não Pago
                return false;
            }
        }
    }

    static async getIndicados (usuarioId: string): Promise<IUsuario[]> {
        const usuarios = <IUsuario[]>await Usuario.Get(`indicado = '${usuarioId}'`);
        return usuarios.filter(x => this.hasPlanoAtivo(x.id));
    }

    static async GetParceiroPorCategoria(categoria: string) : Promise<IUsuario[]>{
        const db = new DB("");
        
        let query = '';
        query += `SELECT `;
        query += `    u.id,`;
        query += `    u.parceiro,`;
        query += `    u.nome,`;
        query += `    c.nome as categoria,`;
        query += `    u.tem_wifi,`;
        query += `    u.wifi_nome,`;
        query += `    u.wifi_senha,`;
        query += `    u.tem_banheiro,`;
        query += `    u.tem_local_descanso,`;
        query += `    u.tem_local_carregar_celular,`;
        query += `    u.rua,`;
        query += `    u.numero,`;
        query += `    u.bairro,`;
        query += `    u.cidade,`;
        query += `    u.estado,`;
        query += `    u.cep,`;
        query += `    u.complemento,`;
        query += `    u.latitude,`;
        query += `    u.longitude `;
        query += `FROM USUARIO u `;
        query += `    INNER JOIN categoria_parceiro c ON c.id = u.categoria `;
        query += `WHERE p.categoria = '${categoria}' AND u.tipo = 2`;

        let parceiros = [];
        try{
            parceiros =  <IUsuario[]>await db.Query(query);
        }catch(e){
            console.log(e);
        }
        
        return parceiros;
    }

}

export default Usuario;
