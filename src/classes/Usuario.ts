import Util from '../System/Util';
import Classes from '../System/Classes';

export interface IUsuario {
    id: string;
    nome: string;
    nome_normalizado: string;
    email: string;
    senha: string;
    cpf: string;
    data_criacao: string;
    indicado: string;
    tipo: number;
    mudar_senha: number;
    status: string|number;

    // Estabelecimento

    cnpj?: string;
    imagem?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
    latitude?: string;
    longitude?: string;
    categoria?: string;
}

class Usuario extends Classes {
    static table = 'usuario';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'email', type: 'string', required: true },
        { name: 'senha', type: 'string', required: true },
        { name: 'cpf', type: 'string', required: false },
        { name: 'tipo', type: 'number', required: true },
        { name: 'mudar_senha', type: 'number', required: false },
        { name: 'indicado', type: 'string', required: false },
        { name: 'data_criacao', type: 'string', required: false },

        // info  de estabelecimento
        { name: 'cnpj', type: 'string', required: false },
        { name: 'imagem', type: 'string', required: false },
        { name: 'rua', type: 'string', required: false },
        { name: 'numero', type: 'string', required: false },
        { name: 'bairro', type: 'string', required: false },
        { name: 'cidade', type: 'string', required: false },
        { name: 'estado', type: 'string', required: false },
        { name: 'cep', type: 'string', required: false },
        { name: 'complemento', type: 'string', required: false },
        { name: 'latitude', type: 'string', required: false },
        { name: 'longitude', type: 'string', required: false },
        { name: 'categoria', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

    static async Validate (data: {[k:string]: any}) : Promise<{ msg: string; }[]> {
        const errors = [];
        

        for(const field of this.fields){
            
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


        if(data.tipo === 1){
            if(typeof data['cpf'] === 'undefined'){
                errors.push({
                    msg: `O campo "CPF" é obrigatório!`
                });
            }else{
                if (!Util.validaCpf(data.cpf)) {
                    errors.push({
                        msg: "CPF inválido!"
                    });
                }
            }
        }
        
        if(data.tipo === 2){
            [ 'cnpj', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'categoria' ].forEach(campo =>{
    
                if(typeof data[campo] === 'undefined' || [null, ''].includes(<string>data[campo])){
                    errors.push({
                        msg: `O campo "${campo}" é obrigatório!`
                    });
                }else if(campo === "cnpj"){
                    if (!Util.validarCNPJ(data.cnpj)) {
                        errors.push({
                            msg: "CNPJ inválido!"
                        });
                    }
                }
            });
        }



        return errors;
    }
}

export default Usuario;
