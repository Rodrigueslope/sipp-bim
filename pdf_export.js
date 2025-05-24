// Função para exportar o relatório como PDF
function exportarParaPDF() {
    // Criar um elemento canvas para renderizar o conteúdo
    const { jsPDF } = window.jspdf;
    
    // Verificar se a biblioteca jsPDF está disponível
    if (!jsPDF) {
        alert("Biblioteca jsPDF não encontrada. Por favor, verifique a instalação.");
        return;
    }
    
    try {
        // Criar um novo documento PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Adicionar título
        pdf.setFontSize(18);
        pdf.text("Simulador de Custos de Projetos BIM - SIPP BIM", 20, 20);
        
        // Adicionar data e hora
        const dataHora = new Date().toLocaleString('pt-BR');
        pdf.setFontSize(10);
        pdf.text(`Relatório gerado em: ${dataHora}`, 20, 30);
        
        // Adicionar linha separadora
        pdf.line(20, 35, 190, 35);
        
        // Adicionar dados do projeto
        pdf.setFontSize(14);
        pdf.text("Dados do Projeto", 20, 45);
        
        // Obter dados do formulário
        const tipoProjeto = document.getElementById("tipo-projeto-principal").options[document.getElementById("tipo-projeto-principal").selectedIndex].text;
        const areaProjeto = document.getElementById("area-projeto").value || "Não informado";
        const qtdProfissionais = document.getElementById("qtd-profissionais").value || "Não informado";
        const complexidade = document.getElementById("complexidade").options[document.getElementById("complexidade").selectedIndex].text;
        const localidade = document.getElementById("localidade").value || "Não informado";
        const lod = document.getElementById("lod").options[document.getElementById("lod").selectedIndex].text;
        
        // Adicionar dados do projeto ao PDF
        pdf.setFontSize(12);
        pdf.text(`Tipo de Projeto: ${tipoProjeto}`, 25, 55);
        pdf.text(`Área do Projeto: ${areaProjeto} m²`, 25, 62);
        pdf.text(`Quantidade de Profissionais: ${qtdProfissionais}`, 25, 69);
        pdf.text(`Complexidade: ${complexidade}`, 25, 76);
        pdf.text(`Localidade: ${localidade}`, 25, 83);
        pdf.text(`Nível de Desenvolvimento (LOD): ${lod}`, 25, 90);
        
        // Adicionar linha separadora
        pdf.line(20, 95, 190, 95);
        
        // Adicionar resultados da simulação
        pdf.setFontSize(14);
        pdf.text("Resultado da Simulação", 20, 105);
        
        // Obter resultados
        const faixaValores = document.getElementById("faixa-valores").textContent;
        const valorSugerido = document.getElementById("valor-sugerido").textContent;
        
        // Adicionar resultados ao PDF
        pdf.setFontSize(12);
        pdf.text(faixaValores, 25, 115);
        pdf.text(valorSugerido, 25, 122);
        
        // Adicionar linha separadora
        pdf.line(20, 127, 190, 127);
        
        // Adicionar explicação detalhada
        pdf.setFontSize(14);
        pdf.text("Explicação Detalhada do Cálculo", 20, 137);
        
        // Obter passos do cálculo
        const observacoesList = document.getElementById("lista-observacoes");
        const observacoes = [];
        for (let i = 0; i < observacoesList.children.length; i++) {
            observacoes.push(observacoesList.children[i].textContent);
        }
        
        // Adicionar passos ao PDF
        pdf.setFontSize(10);
        let yPos = 147;
        observacoes.forEach(obs => {
            // Verificar se há espaço suficiente na página atual
            if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
            }
            
            // Quebrar texto longo em múltiplas linhas
            const linhas = pdf.splitTextToSize(obs, 160);
            pdf.text(linhas, 25, yPos);
            yPos += 7 * linhas.length;
        });
        
        // Adicionar rodapé
        pdf.setFontSize(8);
        pdf.text("© SIPP BIM - Simulador de Custos de Projetos BIM", 20, 285);
        
        // Salvar o PDF
        pdf.save("Simulacao_Custos_BIM.pdf");
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    }
}
