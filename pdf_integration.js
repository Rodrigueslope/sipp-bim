// Função para integrar com o backend de geração de PDF
function exportarParaPDF() {
    // Verifica se há resultados para exportar
    if (resultadoSection.style.display !== "block") {
        alert("Por favor, realize uma simulação antes de exportar o relatório.");
        return;
    }
    
    // Preparar dados para enviar ao backend
    const tipoProjetoSelecionado = tipoProjeto.value;
    const area = parseFloat(areaInput.value) || 0;
    const complexidadeSelecionada = complexidadeSelect.value;
    const lodSelecionado = lodSelect.value;
    const localidadeValor = localidadeInput.value || "Não informado";
    
    // Obter perfis profissionais
    const perfis = {
        "Engenheiro Júnior": parseInt(engJuniorInput.value || 0),
        "Engenheiro Pleno": parseInt(engPlenoInput.value || 0),
        "Engenheiro Sênior": parseInt(engSeniorInput.value || 0),
        "Arquiteto Júnior": parseInt(arqJuniorInput.value || 0),
        "Arquiteto Pleno": parseInt(arqPlenoInput.value || 0),
        "Arquiteto Sênior": parseInt(arqSeniorInput.value || 0)
    };
    
    // Obter informações de distribuição de horas
    let distribuicaoHoras = "Padrão (Júnior: 20%, Pleno: 40%, Sênior: 40%)";
    let percentuais = {
        "Júnior": 20,
        "Pleno": 40,
        "Sênior": 40
    };
    
    if (distribuicaoPersonalizada) {
        distribuicaoHoras = "Personalizada";
        percentuais = {
            "Júnior": parseInt(percJuniorInput.value || 0),
            "Pleno": parseInt(percPlenoInput.value || 0),
            "Sênior": parseInt(percSeniorInput.value || 0)
        };
    }
    
    // Obter tipo de cálculo em formato legível
    let tipoCalculoLegivel = "";
    switch (tipoCalculoSelecionado) {
        case "metro":
            tipoCalculoLegivel = "Por metro quadrado (R$/m²)";
            break;
        case "hora":
            tipoCalculoLegivel = "Por hora técnica (R$/h) - Estimativa";
            break;
        case "hora-perfil":
            tipoCalculoLegivel = "Por Hora Técnica dos Profissionais Envolvidos";
            break;
        case "escopo":
            tipoCalculoLegivel = "Valor fechado por escopo - Estimativa";
            break;
        default:
            tipoCalculoLegivel = tipoCalculoSelecionado;
    }
    
    // Dados para enviar ao backend
    const dadosPDF = {
        tipoProjeto: tipoProjetoSelecionado,
        area: area,
        complexidade: complexidadeSelecionada,
        lod: lodSelecionado,
        baseCalculo: selecionadaBaseCalculo,
        tipoCalculo: tipoCalculoLegivel,
        localidade: localidadeValor,
        perfis: perfis,
        distribuicaoHoras: distribuicaoHoras,
        percentuais: percentuais,
        faixaEstimada: faixaEstimadaElement.textContent,
        valorSugerido: valorSugeridoElement.textContent,
        explicacaoDetalhada: explicacaoDetalhada.innerHTML
    };
    
    // Mostrar mensagem de processamento
    const mensagemProcessando = document.createElement("div");
    mensagemProcessando.id = "mensagem-processando";
    mensagemProcessando.style.position = "fixed";
    mensagemProcessando.style.top = "50%";
    mensagemProcessando.style.left = "50%";
    mensagemProcessando.style.transform = "translate(-50%, -50%)";
    mensagemProcessando.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    mensagemProcessando.style.color = "white";
    mensagemProcessando.style.padding = "20px";
    mensagemProcessando.style.borderRadius = "5px";
    mensagemProcessando.style.zIndex = "1000";
    mensagemProcessando.textContent = "Gerando PDF, por favor aguarde...";
    document.body.appendChild(mensagemProcessando);
    
    // Criar um formulário oculto para enviar os dados
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/generate-pdf";
    form.target = "_blank"; // Abre em uma nova aba
    form.style.display = "none";
    
    // Adicionar campo de dados
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(dadosPDF);
    form.appendChild(input);
    
    // Adicionar formulário ao documento e enviar
    document.body.appendChild(form);
    
    // Criar um iframe oculto para receber a resposta
    const iframe = document.createElement("iframe");
    iframe.name = "pdf-iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    
    // Configurar o formulário para usar o iframe
    form.target = "pdf-iframe";
    
    // Enviar o formulário
    form.submit();
    
    // Remover elementos após um tempo
    setTimeout(() => {
        document.body.removeChild(mensagemProcessando);
        document.body.removeChild(form);
        document.body.removeChild(iframe);
    }, 5000);
    
    // Alternativa: usar fetch API para enviar os dados
    fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPDF),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao gerar o PDF');
        }
        return response.blob();
    })
    .then(blob => {
        // Criar URL para o blob
        const url = window.URL.createObjectURL(blob);
        
        // Criar link para download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Simulacao_Custos_BIM.pdf';
        
        // Adicionar à página e clicar
        document.body.appendChild(a);
        a.click();
        
        // Limpar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        document.body.removeChild(mensagemProcessando);
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        document.body.removeChild(mensagemProcessando);
    });
}
