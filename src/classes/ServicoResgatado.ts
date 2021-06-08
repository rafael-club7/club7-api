import Classes from '../System/Classes';
import { getTipoResgateName, IServico } from './Servico';
import { IUsuario } from './Usuario';

export interface IServicoResgatado
{
    id: string;
    usuario: string;
    parceiro: string;
    servico: string;
    codigo: string;
    data: string;
    status: string|number;
    
    usuario_nome?: string;
    servico_nome?: string;
}


class ServicoResgatado extends Classes {
    static table = 'servico_resgatado';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: false },
        { name: 'parceiro', type: 'string', required: false },
        { name: 'codigo', type: 'string', required: false },
        { name: 'servico', type: 'string', required: true },
        { name: 'data', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

    static async servicoValido(usuario: IUsuario, servico: IServico) : Promise<IServico>{
        const hoje = new Date();
        if(servico.validade !== null && new Date(servico.validade) < hoje){
            servico.status = 0;
            servico.erro_resgate = "Esse servico não está mais disponível";
        }
        
        if (getTipoResgateName(Number(servico.tipo_resgate)) === "UNICO") {
            const jaResgatado = <IServicoResgatado>await ServicoResgatado.GetFirst(`servico = '${servico.id}' AND usuario = '${usuario.id}'`);
            if (jaResgatado !== null) {
                servico.status = 0;
                servico.erro_resgate = "Você já resgatou esse serviço!";

                if(jaResgatado.servico === servico.id && jaResgatado.status === 1){
                    servico.status = 2;
                    servico.codigo_resgate = jaResgatado.codigo;
                }
            }
        }
        
        if (getTipoResgateName(Number(servico.tipo_resgate)) === "MENSAL") {
            const mesPassado = new Date();
            mesPassado.setMonth(hoje.getMonth() - 1);
            mesPassado.setHours(0);
            mesPassado.setMinutes(0);
            mesPassado.setSeconds(0);
            
            const jaResgatado = <IServicoResgatado>await ServicoResgatado.GetFirst(`servico = '${servico.id}' AND usuario = '${usuario.id}' AND data >= '${mesPassado.toJSON()}'`);
            if (jaResgatado !== null){
                // Você já resgatou esse servico nesse mês
                servico.status = 0;
                servico.erro_resgate = "Você já resgatou esse serviço este mês!";
                
                if(jaResgatado.servico === servico.id && jaResgatado.status === 1){
                    servico.status = 2;
                    servico.codigo_resgate = jaResgatado.codigo;
                }
            }
        }
        
        hoje.setHours(0);
        hoje.setMinutes(0);
        hoje.setSeconds(0);
        
        const servicoResgatadoHoje = <IServicoResgatado>await ServicoResgatado.GetFirst(`parceiro = '${servico.parceiro}' AND data > '${hoje.toJSON()}' AND usuario = '${usuario.id}'`);
        if (servicoResgatadoHoje !== null) {
            // Você já resgatou um serviço aqui hoje!
            servico.status = 0;
            servico.erro_resgate = "Você já resgatou um serviço aqui hoje!";
            
            if(servicoResgatadoHoje.servico === servico.id && servicoResgatadoHoje.status === 1){
                servico.status = 2;
                servico.codigo_resgate = servicoResgatadoHoje.codigo;
            }
        }

        return servico;
    }
}

export default ServicoResgatado;
