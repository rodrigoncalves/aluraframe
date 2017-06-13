class NegociacaoController {

    constructor() {

        let $ = document.querySelector.bind(document);
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');

        this._listaNegociacoes = new Bind(
            new ListaNegociacoes(),
            new NegociacoesView($('#negociacoesView')),
            'adiciona', 'esvazia', 'sort', 'reverse');

        this._mensagem = new Bind(
            new Mensagem(),
            new MensagemView($('#mensagemView')), 'texto');

        this._currentColumn = '';

        this._service = new NegociacaoService();

        this._init();
    }

    _init() {

        this._service.lista()
            .then(negociacoes =>
                negociacoes.forEach(negociacao =>
                    this._listaNegociacoes.adiciona(negociacao)))
            .catch(erro => {
                console.log(erro);
                this._mensagem.texto = erro;
            });

        this.importaNegociacoes();
        setInterval(() => this.importaNegociacoes(), 3000);

    }

    adiciona(event) {
        event.preventDefault();

        let negociacao = this._criaNegociacao();
        this._service.cadastra(negociacao)
            .then(mensagem => {
                this._listaNegociacoes.adiciona(negociacao);
                this._mensagem.texto = mensagem;
                this._limpaFormulario();
            })
            .catch(erro => this._mensagem.texto = erro);
    }

    importaNegociacoes() {

        this._service.importa(this._listaNegociacoes.negociacoes)
        .then(negociacoes => {
            negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
            this._mensagem.texto = 'Negociações importadas com sucesso';
        })
        .catch(erro => this._mensagem.texto = erro);
    }

    sort(column) {

        if (this._currentColumn == column) {
            this._listaNegociacoes.reverse();
        } else {
            this._listaNegociacoes.sort((a, b) => b[column] - a[column]);
        }

        this._currentColumn = column;
    }

    apaga() {

        this._service.apaga()
        .then(mensagem => {
            this._listaNegociacoes.esvazia();
            this._mensagem.texto = mensagem;
        })
        .catch(erro => this._mensagem.texto = erro);
    }

    _criaNegociacao() {

        return new Negociacao(
            DateHelper.textoParaData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value));
    }

    _limpaFormulario() {

        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;
        this._inputData.focus();
    }
}
