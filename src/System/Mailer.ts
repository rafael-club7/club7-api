class Mailer{

    from: string;
    to: string;
    subject: string;
    message: string;
    transporter: any;
    response: any;

    constructor(host = process.env.MAIL_HOST, 
        port = process.env.MAIL_PORT, 
        user = process.env.MAIL_USER,
        pass = process.env.MAIL_PASS,
        from = `Club 7 <${process.env.MAIL_USER}>`){
        
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
            name: "outlook",
            host: host,
            port: port,
            secure: false,
            auth: {
                user: user,
                pass: pass
            },
            tls: { rejectUnauthorized: false }
        });

        this.from = from;
    }
    
    async Send(){
        return new Promise((resolve, reject) => {
            const obrigatorios = [ "to", "subject", "message" ];
            const errors = [];
    
            obrigatorios.forEach(campo => {
                if(!(this[campo])){
                    errors.push({
                        status: 0,
                        msg: "O campo '" + campo + "' precisa ser definido!"
                    });
                }
            });
    
            if(errors.length > 0){
                reject({
                    errors: errors,
                    status: 0
                });
                return;
            }
    
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject: this.subject,
                html: this.message
            };
            
            this.transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });

    }

    static SolicitarNovaSenha(link){
        const mail = {
            titulo: "Club7 - Nova Senha!",
            email: ''
        };

        mail.email += `<html>`;
        mail.email += `   <body style="width:600px; margin:0; padding:0;font-family:Circular, Helvetica, Arial, sans-serif; position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto;">`;
        mail.email += `       <div style="width:100%; height:80px; background-color:#3C8DBC; line-height: 80px; text-align: center;">`;
        mail.email += `           <span style="color:white;font-size:30px"> <b>Lead</b>This </span>`;
        mail.email += `       </div>`;
        mail.email += `       <div style="width:100%; height: 300px;">`;
        mail.email += `           <div style="width: 80%; height: 200px; background-color:white; text-align: center; padding: 25px 10%">`;
        mail.email += `               <h2 style="border:none;margin:0px;padding:0px;text-decoration:none;color:rgb(0, 0, 0);font-size:40px;font-weight:bold;line-height:45px;letter-spacing:-0.04em;text-align:center;">Você solicitou uma nova senha?</h2>`;
        mail.email += `               <p style="font-size: 25px;"> Aqui vai o link onde você pode definir uma nova senha: <a href="${link}">Clique aqui</a> </p>`;
        mail.email += `           </div>`;
        mail.email += `           <div style="max-width:100%; min-height: 30px; background-color: #F7F7F7; padding: 5px 0 5px 20px">`;
        mail.email += `               <p style="color: #88898C; font-size: 20px;"><b>Lead</b>This</p>`;
        mail.email += `               <p><small style="color: #ddd;">by LeadTHis - 2020</small></p>`;
        mail.email += `           </div>`;
        mail.email += `       </div>`;
        mail.email += `   </body>`;
        mail.email += `</html>`;
        return mail;
    }

}

export default Mailer;
