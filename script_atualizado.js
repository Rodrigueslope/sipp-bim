document.addEventListener("DOMContentLoaded", function() {
    // Elementos do formulário
    const tipoProjeto = document.getElementById("tipo-projeto");
    const tipoCalculo = document.querySelectorAll('input[name="tipo-calculo"]');
    const areaInput = document.getElementById("area");
    const complexidadeSelect = document.getElementById("complexidade");
    const localidadeInput = document.getElementById("localidade");
    const lodSelect = document.getElementById("lod");
    const baseCalculoBtns = document.querySelectorAll(".base-calculo-btn");
    const simularCustoButton = document.getElementById("simular-custo");
    const exportarPDFButton = document.getElementById("exportar-pdf");
    const baseCalculoSection = document.getElementById("base-calculo-section");
    
    // Elementos de perfis profissionais
    const engJuniorInput = document.getElementById("eng-junior");
    const engPlenoInput = document.getElementById("eng-pleno");
    const engSeniorInput = document.getElementById("eng-senior");
    const arqJuniorInput = document.getElementById("arq-junior");
    const arqPlenoInput = document.getElementById("arq-pleno");
    const arqSeniorInput = document.getElementById("arq-senior");
    
    // Elementos de distribuição de horas
    const personalizarDistribuicaoBtn = document.getElementById("personalizar-distribuicao-btn");
    const personalizarDistribuicaoDiv = document.getElementById("personalizar-distribuicao");
    const percJuniorInput = document.getElementById("perc-junior");
    const percPlenoInput = document.getElementById("perc-pleno");
    const percSeniorInput = document.getElementById("perc-senior");
    const percTotalSpan = document.getElementById("perc-total");
    
    // Elementos de resultado
    const resultadoSection = document.getElementById("resultado");
    const faixaEstimadaElement = document.getElementById("faixa-estimada");
    const valorSugeridoElement = document.getElementById("valor-sugerido");
    const explicacaoDetalhada = document.getElementById("explicacao-detalhada");
    
    // Valores de referência para perfis profissionais
    const valoresPerfis = {
        "eng-junior": 85,
        "eng-pleno": 145,
        "eng-senior": 210,
        "arq-junior": 75,
        "arq-pleno": 125,
        "arq-senior": 190
    };
    
    // Valores de referência por tipo de projeto
    const valoresHora = {
        "Arquitetônico": 145.42,
        "Estrutural": 132.50,
        "Instalações (Elétrica, Hidráulica, etc)": 128.75,
        "Compatibilização BIM": 155.30,
        "Coordenação BIM": 165.80,
        "As Built / Levantamento BIM": 140.25,
        "Digital Twin": 180.00,
        "Outros (especificar)": 150.00
    };
    
    // Multiplicadores de complexidade
    const multiplicadoresComplexidade = {
        "Baixa": 0.8,
        "Média": 1.0,
        "Alta": 1.3
    };
    
    // Multiplicadores de LOD
    const multiplicadoresLOD = {
        "LOD 100": 0.7,
        "LOD 200": 0.85,
        "LOD 300": 1.0,
        "LOD 350": 1.15,
        "LOD 400": 1.3,
        "LOD 500": 1.5
    };
    
    // Percentuais CAIXA/SINAPI atualizados para cálculo por CUB
    const percentuaisCUB = {
        "Arquitetônico": { min: 0.015, max: 0.020 },
        "Estrutural": { min: 0.008, max: 0.012 },
        "Instalações (Elétrica, Hidráulica, etc)": { min: 0.005, max: 0.008 },
        "Compatibilização BIM": { min: 0.005, max: 0.010 },
        "Coordenação BIM": { min: 0.005, max: 0.010 },
        "As Built / Levantamento BIM": { min: 0.003, max: 0.006 },
        "Digital Twin": { min: 0.010, max: 0.015 },
        "Outros (especificar)": { min: 0.005, max: 0.010 }
    };
    
    // Valores CUB por região (R$/m²) - Atualizados para Maio 2025
    // Chaves exatamente iguais aos valores de data-base dos botões
    const valoresCUB = {
        "Sinduscon-PA (Norte - Abril/2025)": 2159.97,
        "Sinduscon-JP (Nordeste - Julho/2024)": 1612.60,
        "Sinduscon-SP (Sudeste - Abril/2025)": 2053.66,
        "Sinduscon-PR (Sul - Abril/2025)": 2462.10,
        "Média de Mercado (Base Edital SRPFAM)": 0 // Não usa CUB, usa valor/hora
    };
    
    // Variáveis de estado
    let selecionadaBaseCalculo = "Média de Mercado (Base Edital SRPFAM)";
    let tipoCalculoSelecionado = "metro";
    let distribuicaoPersonalizada = false;
    
    // Selecionar automaticamente a base de cálculo padrão ao carregar a página
    document.querySelector('button[data-base="Média de Mercado (Base Edital SRPFAM)"]').classList.add("selected");
    
    // Função para atualizar a visibilidade das bases de cálculo com base no tipo de cálculo
    function atualizarVisibilidadeBaseCalculo() {
        const baseCalculoBtns = document.querySelectorAll(".base-calculo-btn");
        
        if (tipoCalculoSelecionado === "metro") {
            // Se o tipo de cálculo for por metro quadrado, mostrar apenas os Sinduscons
            let sindusconSelecionado = false;
            
            baseCalculoBtns.forEach(btn => {
                const baseCalculo = btn.getAttribute("data-base");
                if (baseCalculo.includes("Sinduscon")) {
                    btn.style.display = "inline-block";
                    
                    // Se já temos um Sinduscon selecionado, não fazemos nada
                    if (btn.classList.contains("selected")) {
                        sindusconSelecionado = true;
                        selecionadaBaseCalculo = baseCalculo;
                    }
                } else {
                    btn.style.display = "none";
                    // Se a base selecionada for a que estamos escondendo, remover a seleção
                    if (btn.classList.contains("selected")) {
                        btn.classList.remove("selected");
                    }
                }
            });
            
            // Se nenhum Sinduscon estiver selecionado, selecionar o primeiro
            if (!sindusconSelecionado) {
                const primeiroBotaoSinduscon = document.querySelector('button[data-base*="Sinduscon"]');
                if (primeiroBotaoSinduscon) {
                    baseCalculoBtns.forEach(b => b.classList.remove("selected"));
                    primeiroBotaoSinduscon.classList.add("selected");
                    selecionadaBaseCalculo = primeiroBotaoSinduscon.getAttribute("data-base");
                }
            }
            
            // Adicionar mensagem explicativa
            const mensagemExplicativa = document.getElementById("mensagem-sinduscon");
            if (!mensagemExplicativa) {
                const mensagem = document.createElement("p");
                mensagem.id = "mensagem-sinduscon";
                mensagem.innerHTML = "<strong>Nota:</strong> Para cálculo por metro quadrado (R$/m²), é necessário selecionar uma base Sinduscon.";
                mensagem.style.color = "#0077b6";
                mensagem.style.marginTop = "10px";
                baseCalculoSection.appendChild(mensagem);
            }
        } else {
            // Para outros tipos de cálculo, mostrar todas as bases
            baseCalculoBtns.forEach(btn => {
                btn.style.display = "inline-block";
            });
            
            // Remover mensagem explicativa se existir
            const mensagemExplicativa = document.getElementById("mensagem-sinduscon");
            if (mensagemExplicativa) {
                baseCalculoSection.removeChild(mensagemExplicativa);
            }
        }
    }
    
    // Adiciona evento de clique aos botões de base de cálculo
    baseCalculoBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            // Remove a classe 'selected' de todos os botões
            baseCalculoBtns.forEach(b => b.classList.remove("selected"));
            
            // Adiciona a classe 'selected' ao botão clicado
            this.classList.add("selected");
            
            // Atualiza a base de cálculo selecionada
            selecionadaBaseCalculo = this.getAttribute("data-base");
            console.log("Base selecionada:", selecionadaBaseCalculo);
        });
    });
    
    // Adiciona eventos aos inputs de tipo de cálculo
    tipoCalculo.forEach(radio => {
        radio.addEventListener("change", function() {
            tipoCalculoSelecionado = this.value;
            atualizarVisibilidadeBaseCalculo();
        });
    });
    
    // Inicializar a visibilidade das bases de cálculo
    atualizarVisibilidadeBaseCalculo();
    
    // Adiciona evento ao botão de personalizar distribuição
    personalizarDistribuicaoBtn.addEventListener("click", function() {
        distribuicaoPersonalizada = !distribuicaoPersonalizada;
        if (distribuicaoPersonalizada) {
            personalizarDistribuicaoDiv.classList.add("ativo");
            this.textContent = "Usar distribuição padrão";
        } else {
            personalizarDistribuicaoDiv.classList.remove("ativo");
            this.textContent = "Personalizar distribuição de horas";
            // Restaurar valores padrão
            percJuniorInput.value = 20;
            percPlenoInput.value = 40;
            percSeniorInput.value = 40;
            atualizarTotalPercentual();
        }
    });
    
    // Adiciona eventos aos inputs de percentual
    [percJuniorInput, percPlenoInput, percSeniorInput].forEach(input => {
        input.addEventListener("input", atualizarTotalPercentual);
    });
    
    // Função para atualizar o total de percentual
    function atualizarTotalPercentual() {
        const percJunior = parseInt(percJuniorInput.value || 0);
        const percPleno = parseInt(percPlenoInput.value || 0);
        const percSenior = parseInt(percSeniorInput.value || 0);
        
        const total = percJunior + percPleno + percSenior;
        percTotalSpan.textContent = total;
        
        // Destacar se o total não for 100%
        if (total !== 100) {
            percTotalSpan.style.color = "red";
        } else {
            percTotalSpan.style.color = "";
        }
    }
    
    // Função para obter o total de profissionais
    function getTotalProfissionais() {
        return parseInt(engJuniorInput.value || 0) +
               parseInt(engPlenoInput.value || 0) +
               parseInt(engSeniorInput.value || 0) +
               parseInt(arqJuniorInput.value || 0) +
               parseInt(arqPlenoInput.value || 0) +
               parseInt(arqSeniorInput.value || 0);
    }
    
    // Função para calcular o valor médio por hora dos profissionais
    function getValorMedioPorHora() {
        const totalProfissionais = getTotalProfissionais();
        if (totalProfissionais === 0) return 0;
        
        const valorTotal = 
            (parseInt(engJuniorInput.value || 0) * valoresPerfis["eng-junior"]) +
            (parseInt(engPlenoInput.value || 0) * valoresPerfis["eng-pleno"]) +
            (parseInt(engSeniorInput.value || 0) * valoresPerfis["eng-senior"]) +
            (parseInt(arqJuniorInput.value || 0) * valoresPerfis["arq-junior"]) +
            (parseInt(arqPlenoInput.value || 0) * valoresPerfis["arq-pleno"]) +
            (parseInt(arqSeniorInput.value || 0) * valoresPerfis["arq-senior"]);
        
        return valorTotal / totalProfissionais;
    }
    
    // Função para calcular o valor do projeto
    function calcularValorProjeto() {
        // Obtém os valores dos inputs
        const tipoProjetoSelecionado = tipoProjeto.value;
        const area = parseFloat(areaInput.value) || 0;
        const complexidadeSelecionada = complexidadeSelect.value;
        const lodSelecionado = lodSelect.value;
        
        // Obtém os multiplicadores
        const multiplicadorComplexidade = multiplicadoresComplexidade[complexidadeSelecionada];
        const multiplicadorLOD = multiplicadoresLOD[lodSelecionado];
        
        let valorTotal = 0;
        let valorHora = valoresHora[tipoProjetoSelecionado];
        let horasEstimadas = 0;
        let explicacao = "";
        
        // Verificar se é cálculo por metro quadrado
        if (tipoCalculoSelecionado === "metro") {
            // Verificar se uma base Sinduscon foi selecionada
            if (!selecionadaBaseCalculo.includes("Sinduscon")) {
                alert("Escolha uma base Sinduscon válida para continuar.");
                return null;
            }
            
            // Obter o valor CUB da base selecionada
            const valorCUB = valoresCUB[selecionadaBaseCalculo];
            console.log("Valor CUB para", selecionadaBaseCalculo, ":", valorCUB);
            
            // Verificar se o valor CUB é válido
            if (!valorCUB || valorCUB <= 0) {
                alert("Escolha uma base Sinduscon válida para continuar.");
                return null;
            }
            
            // Obter os percentuais para o tipo de projeto
            const percentualMin = percentuaisCUB[tipoProjetoSelecionado].min;
            const percentualMax = percentuaisCUB[tipoProjetoSelecionado].max;
            
            // Calcular o valor do projeto (desconsiderando profissionais e horas)
            const valorTotalMin = area * valorCUB * percentualMin * multiplicadorComplexidade * multiplicadorLOD;
            const valorTotalMax = area * valorCUB * percentualMax * multiplicadorComplexidade * multiplicadorLOD;
            valorTotal = (valorTotalMin + valorTotalMax) / 2;
            
            // Explicação detalhada
            explicacao = `
                <h3>Fórmula utilizada:</h3>
                <div class="formula">Valor Total = Área × Valor CUB × Percentual Projeto × Multiplicador Complexidade × Multiplicador LOD</div>
                
                <h3>Passos do cálculo:</h3>
                <ol>
                    <li>Valor CUB base (${selecionadaBaseCalculo}): R$ ${valorCUB.toFixed(2)}/m²</li>
                    <li>Percentual para projeto ${tipoProjetoSelecionado}: ${(percentualMin * 100).toFixed(1)}% a ${(percentualMax * 100).toFixed(1)}% do CUB</li>
                    <li>Aplicação dos multiplicadores de complexidade (${complexidadeSelecionada}: ${multiplicadorComplexidade.toFixed(2)}) e LOD (${lodSelecionado}: ${multiplicadorLOD.toFixed(2)})</li>
                    <li>Valor mínimo: ${area}m² × R$ ${valorCUB.toFixed(2)}/m² × ${(percentualMin * 100).toFixed(1)}% × ${multiplicadorComplexidade.toFixed(2)} × ${multiplicadorLOD.toFixed(2)} = R$ ${valorTotalMin.toFixed(2)}</li>
                    <li>Valor máximo: ${area}m² × R$ ${valorCUB.toFixed(2)}/m² × ${(percentualMax * 100).toFixed(1)}% × ${multiplicadorComplexidade.toFixed(2)} × ${multiplicadorLOD.toFixed(2)} = R$ ${valorTotalMax.toFixed(2)}</li>
                    <li>Valor sugerido (média): R$ ${valorTotal.toFixed(2)}</li>
                </ol>
                
                <h3>Observações sobre o Cálculo:</h3>
                <ul>
                    <li>Base de Referência: ${selecionadaBaseCalculo}</li>
                    <li>Valor do CUB: R$ ${valorCUB.toFixed(2)}/m²</li>
                    <li>Percentuais baseados nas referências CAIXA/SINAPI para projetos BIM</li>
                    <li>Tipo de Projeto Principal: ${tipoProjetoSelecionado}</li>
                    <li>Complexidade: ${complexidadeSelecionada} (multiplicador: ${multiplicadorComplexidade.toFixed(2)})</li>
                    <li>LOD: ${lodSelecionado} (multiplicador: ${multiplicadorLOD.toFixed(2)})</li>
                    <li>Área do Projeto: ${area} m²</li>
                    <li>Nota: Para cálculo por metro quadrado (R$/m²), os profissionais envolvidos e suas horas não são considerados diretamente no cálculo.</li>
                </ul>
            `;
        } else if (tipoCalculoSelecionado === "hora-perfil") {
            // Cálculo por hora técnica dos profissionais envolvidos
            const totalProfissionais = getTotalProfissionais();
            if (totalProfissionais === 0) {
                alert("Por favor, informe a quantidade de pel
(Content truncated due to size limit. Use line ranges to read in chunks)