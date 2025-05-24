#!/usr/bin/env python3
from flask import Flask, request, send_file, jsonify
import weasyprint
import tempfile
import os
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        # Receber dados do formulário
        data = request.json
        
        # Criar HTML para o PDF
        html_content = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Simulação de Custos de Projetos BIM</title>
            <style>
                body {{
                    font-family: "Noto Sans CJK SC", "WenQuanYi Zen Hei", Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }}
                
                h1 {{
                    color: #0077b6;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 24px;
                }}
                
                h2 {{
                    color: #0077b6;
                    border-bottom: 2px solid #0077b6;
                    padding-bottom: 5px;
                    margin-top: 20px;
                    font-size: 18px;
                }}
                
                h3 {{
                    color: #0077b6;
                    margin-top: 15px;
                    font-size: 16px;
                }}
                
                p {{
                    margin: 5px 0;
                }}
                
                .section {{
                    margin-bottom: 20px;
                }}
                
                .formula {{
                    background-color: #f1f8ff;
                    padding: 10px;
                    border-left: 5px solid #0077b6;
                    margin: 15px 0;
                    font-family: monospace;
                }}
                
                ul, ol {{
                    margin-left: 20px;
                    padding-left: 0;
                }}
                
                .resultado-box {{
                    padding: 15px;
                    margin-top: 10px;
                    border-radius: 4px;
                }}
                
                .faixa-estimada {{
                    background-color: #e3f2fd;
                    border-left: 5px solid #2196f3;
                }}
                
                .valor-sugerido {{
                    background-color: #e8f5e9;
                    border-left: 5px solid #4caf50;
                    margin-top: 10px;
                }}
                
                .footer {{
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }}
                
                @page {{
                    size: A4;
                    margin: 2cm;
                }}
            </style>
        </head>
        <body>
            <h1>Simulador de Custos de Projetos BIM - SIPP BIM</h1>
            
            <div class="section">
                <h2>Dados do Projeto</h2>
                <p><strong>Tipo de Projeto:</strong> {data.get('tipoProjeto', 'Não informado')}</p>
                <p><strong>Área:</strong> {data.get('area', 'Não informado')} m²</p>
                <p><strong>Complexidade:</strong> {data.get('complexidade', 'Não informado')}</p>
                <p><strong>LOD:</strong> {data.get('lod', 'Não informado')}</p>
                <p><strong>Base de Cálculo:</strong> {data.get('baseCalculo', 'Não informado')}</p>
                <p><strong>Tipo de Cálculo:</strong> {data.get('tipoCalculo', 'Não informado')}</p>
                <p><strong>Localidade:</strong> {data.get('localidade', 'Não informado')}</p>
            </div>
            
            <div class="section">
                <h2>Perfis Profissionais</h2>
                <ul>
                    {generate_perfis_html(data.get('perfis', {}))}
                </ul>
                
                <p><strong>Distribuição de Horas:</strong> {data.get('distribuicaoHoras', 'Padrão')}</p>
                {generate_distribuicao_html(data.get('percentuais', {}))}
            </div>
            
            <div class="section">
                <h2>Resultados da Simulação</h2>
                
                <div class="resultado-box faixa-estimada">
                    <h3>Faixa Estimada: {data.get('faixaEstimada', 'R$ 0,00 - R$ 0,00')}</h3>
                </div>
                
                <div class="resultado-box valor-sugerido">
                    <h3>Valor Sugerido: {data.get('valorSugerido', 'R$ 0,00')}</h3>
                </div>
            </div>
            
            <div class="section">
                <h2>Explicação Detalhada do Cálculo</h2>
                {data.get('explicacaoDetalhada', '')}
            </div>
            
            <div class="footer">
                <p>Relatório gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
                <p>© SIPP BIM - Simulador de Custos de Projetos BIM</p>
            </div>
        </body>
        </html>
        """
        
        # Criar arquivo temporário para o PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            pdf_path = temp_file.name
        
        # Gerar PDF com WeasyPrint
        weasyprint.HTML(string=html_content).write_pdf(pdf_path)
        
        # Enviar o arquivo PDF como resposta
        return send_file(pdf_path, as_attachment=True, download_name='Simulacao_Custos_BIM.pdf')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_perfis_html(perfis):
    if not perfis:
        return "<li>Nenhum perfil informado</li>"
    
    html = ""
    for perfil, quantidade in perfis.items():
        if quantidade > 0:
            html += f"<li>{perfil}: {quantidade}</li>"
    
    return html

def generate_distribuicao_html(percentuais):
    if not percentuais:
        return ""
    
    html = "<ul>"
    for nivel, percentual in percentuais.items():
        html += f"<li>{nivel}: {percentual}%</li>"
    html += "</ul>"
    
    return html

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
