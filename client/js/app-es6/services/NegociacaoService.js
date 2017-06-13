class NegociacaoService {

    constructor() {
        this._http = new HttpService();
    }

    importa(listaAtual) {

       return this.obterNegociacoes()
           .then(negociacoes =>
               negociacoes.filter(negociacao =>
                   !listaAtual.some(neg => negociacao.isEquals(neg))))
           .catch(erro => {
                throw new Error(erro);
           })

   }

    cadastra(negociacao) {
        return ConnectionFactory.getConnection()
            .then(connection => new NegociacaoDAO(connection))
            .then(dao => dao.adiciona(negociacao))
            .then(()  => 'Negociação adicionada com sucesso')
            .catch(erro => {
                throw new Error(erro);
            });
    }

    lista() {
        return ConnectionFactory.getConnection()
            .then(connection => new NegociacaoDAO(connection))
            .then(dao => dao.listaTodos())
            .catch(erro => {
                console.log(erro);
                throw new Error('Não foi possível obter as negociações');
            });
    }

    apaga() {
        return ConnectionFactory.getConnection()
            .then(connection => new NegociacaoDAO(connection))
            .then(dao => dao.apagaTodos())
            .catch(erro => {
                throw new Error(erro);
            });
    }

    obterNegociacoes() {
        return Promise.all([
            this.obterNegociacoesDaSemana(),
            this.obterNegociacoesDaSemanaAnterior(),
            this.obterNegociacoesDaSemanaRetrasada()
        ]).then(periodos => periodos.reduce((dados, periodo) => dados.concat(periodo), [])
        ).catch(erro => {
            throw new Error(erro);
        });
    }

    obterNegociacoesDaSemana() {
        return this._obterNegociacoes('negociacoes/semana');
    }

    obterNegociacoesDaSemanaAnterior() {
        return this._obterNegociacoes('negociacoes/anterior');
    }

    obterNegociacoesDaSemanaRetrasada() {
        return this._obterNegociacoes('negociacoes/retrasada');
    }

    _obterNegociacoes(url) {

        return this._http
            .get(url)
            .then(negociacoes => {
                return negociacoes.map(obj => new Negociacao(new Date(obj.data), obj.quantidade, obj.valor));
            })
            .catch(erro => {
                console.log(erro);
                throw new Error('Não foi possível obter as negociações');
            });
    }
}
