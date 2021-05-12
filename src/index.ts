import app from './app';
require('dotenv').config();

process.env.TZ = 'America/Sao_Paulo';
const port = (process.env.NODE_PORT) ? process.env.NODE_PORT : 3333;

Date.prototype.toJSON = function() {
    function addZ(n) {
        return (n<10? '0' : '') + n;
    }
    return this.getFullYear() + '-' + 
        addZ(this.getMonth() + 1) + '-' + 
        addZ(this.getDate()) + 'T' + 
        addZ(this.getHours()) + ":" +
        addZ(this.getMinutes()) + ":" +
        addZ(this.getSeconds()) + "." +
        addZ(this.getMilliseconds()) + "Z";
}; 

app.listen(port, async () => {
    console.log('--------------------------------------------');
    for (let index = 0; index < 10; index++) console.log('\n');
    console.clear();
    console.log(`Rodando na porta ${port}`);
});
