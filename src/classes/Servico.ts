import Classes from '../System/Classes';


export const TiposResgate = [
    { id: 1, label: "Único", name: "UNICO" },
    { id: 2, label: "Mensal", name: "MENSAL" },
];

export const TiposDesconto = [
    { id: 1, label: "Porcentagem", name: "PORCENTAGEM" },
    { id: 2, label: "Valor", name: "VALOR" },
];

export const getTipoResgateName = (forma : number) : string => {
    const _forma = TiposResgate.find(x => x.id === forma);
    return _forma.name;
};

export const getTipoResgateLabel = (forma : number) : string => {
    return TiposResgate.find(x => x.id === forma).label;
};

export interface IServico
{
    id: string;
    nome: string;
    nome_normalizado: string;
    descricao: string;
    desconto: number;
    tipo_desconto: string|number;
    tipo_resgate: string|number;
    parceiro: string;
    validade: string;
    codigo_resgate?: string;
    erro_resgate?: string;
    status: string|number;
}

class Servico extends Classes {
    static table = 'servico';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'descricao', type: 'string', required: false },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'parceiro', type: 'string', required: false },
        { name: 'desconto', type: 'number', required: true },
        { name: 'tipo_desconto', type: 'number', required: true },
        { name: 'tipo_resgate', type: 'number', required: true },
        { name: 'validade', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

}

export default Servico;
