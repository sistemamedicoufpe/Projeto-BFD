import { useState } from 'react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Como cadastrar um novo paciente?',
    answer: 'Acesse o menu "Pacientes" e clique no botao "Novo Paciente". Preencha os dados cadastrais obrigatorios (nome, data de nascimento, sexo) e opcionais (CPF, contato, historico medico). Clique em "Salvar" para finalizar o cadastro.',
  },
  {
    question: 'Como realizar uma avaliacao neurologica?',
    answer: 'Acesse o menu "Avaliacoes" e clique em "Nova Avaliacao". Selecione o paciente, preencha os dados basicos e escolha os testes cognitivos desejados (MMSE, MoCA, Teste do Relogio). Complete cada teste seguindo as instrucoes na tela.',
  },
  {
    question: 'Como interpretar os resultados do MMSE?',
    answer: 'O MMSE (Mini Exame do Estado Mental) possui pontuacao maxima de 30 pontos. Escores entre 24-30 indicam funcao cognitiva normal, 18-23 sugerem comprometimento leve, 10-17 comprometimento moderado, e abaixo de 10 comprometimento grave. A interpretacao deve considerar escolaridade e idade do paciente.',
  },
  {
    question: 'Como gerar um relatorio/laudo?',
    answer: 'Acesse o menu "Relatorios" e clique em "Novo Relatorio". Selecione o paciente e a avaliacao desejada. O sistema gerara automaticamente um rascunho que pode ser editado. Apos revisar, clique em "Gerar PDF" para exportar o laudo.',
  },
  {
    question: 'O sistema funciona offline?',
    answer: 'Sim! O sistema foi desenvolvido com arquitetura offline-first. Todos os dados sao armazenados localmente (IndexedDB) e sincronizados quando ha conexao. Voce pode cadastrar pacientes, realizar avaliacoes e gerar relatorios mesmo sem internet.',
  },
  {
    question: 'Como exportar os dados de um paciente?',
    answer: 'Na ficha do paciente, clique no botao "Exportar". Voce pode escolher o formato (JSON ou CSV) e selecionar quais dados incluir. Ha opcao de anonimizacao para remover dados identificaveis (LGPD).',
  },
  {
    question: 'O que significa a probabilidade mostrada pela IA?',
    answer: 'O sistema utiliza inteligencia artificial para sugerir probabilidades diagnosticas (Alzheimer, Demencia com Corpos de Lewy, Demencia Frontotemporal, Declinio Cognitivo Leve). IMPORTANTE: Esses valores sao apenas sugestoes e NAO substituem o julgamento clinico do profissional.',
  },
  {
    question: 'Como alterar minha senha?',
    answer: 'Acesse o menu "Configuracoes", na secao "Seguranca" clique em "Alterar senha". Digite sua senha atual, a nova senha (minimo 6 caracteres) e confirme. Clique em "Alterar Senha" para salvar.',
  },
]

const shortcuts = [
  { keys: 'Ctrl + N', description: 'Novo paciente/avaliacao' },
  { keys: 'Ctrl + S', description: 'Salvar formulario atual' },
  { keys: 'Ctrl + P', description: 'Imprimir/Gerar PDF' },
  { keys: 'Esc', description: 'Fechar modal/Cancelar' },
  { keys: 'Tab', description: 'Navegar entre campos' },
  { keys: '/', description: 'Buscar paciente' },
]

const quickStartSteps = [
  { step: 1, title: 'Cadastre um paciente', description: 'Acesse Pacientes > Novo Paciente' },
  { step: 2, title: 'Inicie uma avaliacao', description: 'Acesse Avaliacoes > Nova Avaliacao' },
  { step: 3, title: 'Aplique os testes', description: 'Selecione MMSE, MoCA ou Teste do Relogio' },
  { step: 4, title: 'Gere o relatorio', description: 'Acesse Relatorios > Novo Relatorio' },
]

export function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Ajuda e Suporte</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Central de ajuda, documentacao e perguntas frequentes</p>
        </div>

        {/* Quick Start Guide */}
        <Card>
          <CardHeader
            title="Guia de Inicio Rapido"
            subtitle="Comece a usar o sistema em 4 passos simples"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStartSteps.map((item) => (
                <div
                  key={item.step}
                  className="relative p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary-500"
                >
                  <div className="absolute -left-3 top-4 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 ml-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-2">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader
            title="Perguntas Frequentes (FAQ)"
            subtitle="Encontre respostas para as duvidas mais comuns"
          />
          <CardContent>
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="border dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader
              title="Atalhos de Teclado"
              subtitle="Navegue mais rapido pelo sistema"
            />
            <CardContent>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader
              title="Contato e Suporte"
              subtitle="Precisa de mais ajuda?"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">suporte@neurodiagnostico.com.br</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Telefone
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mt-1">(11) 9999-9999</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Seg-Sex: 8h-18h</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documentacao Tecnica
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 mt-1 text-sm">
                    Acesse a documentacao completa para integracao e uso avancado do sistema.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open('https://docs.neurodiagnostico.com.br', '_blank')}
                  >
                    Acessar Docs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader title="Sobre o Sistema" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Versao</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">2.0.0</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Ultima Atualizacao</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">Janeiro 2026</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Conformidade</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">LGPD, ANVISA</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Acessibilidade</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">WCAG 2.1 AA</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Aviso Legal:</strong> Este sistema e uma ferramenta de apoio ao diagnostico e NAO substitui
                a avaliacao clinica do profissional de saude. Os resultados da IA sao sugestoes que devem ser
                validadas por especialistas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
