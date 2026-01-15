import jsPDF from 'jspdf';
import type { Patient, Evaluation, Report } from '@/types';

interface MMSEResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  domainScores: Record<string, { score: number; maxScore: number }>;
}

interface MoCAResult {
  totalScore: number;
  adjustedScore?: number;
  maxScore: number;
  percentage: number;
  interpretation: string;
  educationAdjusted: boolean;
  domainScores: Record<string, { score: number; maxScore: number }>;
}

interface ClockDrawingResult {
  score: number;
  maxScore: number;
  interpretation: string;
  drawingData?: string;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  /**
   * Check if need new page
   */
  private checkPageBreak(spaceNeeded: number = 20) {
    if (this.currentY + spaceNeeded > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Add header to the document
   */
  private addHeader() {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NeuroCare Diagnostic System', this.pageWidth / 2, this.currentY, {
      align: 'center',
    });
    this.currentY += 10;

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Relatório de Avaliação Neurológica', this.pageWidth / 2, this.currentY, {
      align: 'center',
    });
    this.currentY += 15;

    // Separator line
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  /**
   * Add section title
   */
  private addSectionTitle(title: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185); // Blue
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setTextColor(0, 0, 0); // Reset to black
  }

  /**
   * Add field with label and value
   */
  private addField(label: string, value: string, bold: boolean = false) {
    this.checkPageBreak(8);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label + ':', this.margin, this.currentY);

    const labelWidth = this.doc.getTextWidth(label + ': ');
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');

    // Handle long text with wrapping
    const maxWidth = this.pageWidth - this.margin * 2 - labelWidth;
    const lines = this.doc.splitTextToSize(value, maxWidth);

    lines.forEach((line: string, index: number) => {
      if (index === 0) {
        this.doc.text(line, this.margin + labelWidth, this.currentY);
      } else {
        this.currentY += 5;
        this.checkPageBreak(5);
        this.doc.text(line, this.margin + labelWidth, this.currentY);
      }
    });

    this.currentY += 7;
  }

  /**
   * Add multi-line text
   */
  private addMultiLineText(text: string) {
    this.checkPageBreak(10);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const maxWidth = this.pageWidth - this.margin * 2;
    const lines = this.doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      this.checkPageBreak(5);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 3;
  }

  /**
   * Add patient information
   */
  private addPatientInfo(patient: Patient) {
    this.addSectionTitle('Informações do Paciente');

    this.addField('Nome', patient.nome);
    if (patient.cpf) {
      this.addField('CPF', patient.cpf);
    }
    this.addField('Data de Nascimento', new Date(patient.dataNascimento).toLocaleDateString('pt-BR'));
    this.addField('Idade', `${patient.idade} anos`);
    this.addField('Gênero', this.formatGender(patient.sexo));

    if (patient.telefone) {
      this.addField('Contato', patient.telefone);
    }

    this.currentY += 5;
  }

  /**
   * Add evaluation information
   */
  private addEvaluationInfo(evaluation: Evaluation) {
    this.addSectionTitle('Dados da Avaliação');

    this.addField('Data da Avaliação', new Date(evaluation.data).toLocaleDateString('pt-BR'));

    if (evaluation.queixaPrincipal) {
      this.addField('Queixa Principal', evaluation.queixaPrincipal);
    }

    if (evaluation.historiaDoenca) {
      this.addField('História da Doença Atual', evaluation.historiaDoenca);
    }

    if (evaluation.hipoteseDiagnostica && evaluation.hipoteseDiagnostica.length > 0) {
      const diagnosticos = evaluation.hipoteseDiagnostica.map(h => h.diagnostico).join(', ');
      this.addField('Hipótese Diagnóstica', diagnosticos, true);
    }

    this.currentY += 5;
  }

  /**
   * Add MMSE results
   */
  private addMMSEResults(mmseResult: MMSEResult) {
    this.addSectionTitle('Resultados do MMSE (Mini-Mental State Examination)');

    // Score box
    this.checkPageBreak(25);
    this.doc.setFillColor(240, 248, 255); // Light blue
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pontuação Total:', this.margin + 5, this.currentY + 8);

    this.doc.setFontSize(16);
    this.doc.setTextColor(41, 128, 185);
    this.doc.text(`${mmseResult.totalScore}/30`, this.pageWidth - this.margin - 5, this.currentY + 8, {
      align: 'right',
    });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Interpretação:', this.margin + 5, this.currentY + 16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(mmseResult.interpretation, this.margin + 35, this.currentY + 16);

    this.currentY += 25;

    // Domain scores
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('Pontuação por Domínio:', this.margin, this.currentY);
    this.currentY += 7;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    Object.entries(mmseResult.domainScores).forEach(([domain, data]) => {
      this.checkPageBreak(6);
      this.doc.text(domain, this.margin + 5, this.currentY);
      this.doc.text(`${data.score}/${data.maxScore}`, this.pageWidth - this.margin - 5, this.currentY, {
        align: 'right',
      });

      // Progress bar
      const barWidth = 40;
      const barX = this.pageWidth - this.margin - barWidth - 20;
      const barY = this.currentY - 3;
      const percentage = data.maxScore > 0 ? (data.score / data.maxScore) : 0;

      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(barX, barY, barWidth, 4);
      this.doc.setFillColor(41, 128, 185);
      this.doc.rect(barX, barY, barWidth * percentage, 4, 'F');

      this.currentY += 6;
    });

    this.currentY += 5;
  }

  /**
   * Add MoCA results
   */
  private addMoCAResults(mocaResult: MoCAResult) {
    this.addSectionTitle('Resultados do MoCA (Montreal Cognitive Assessment)');

    // Score box
    this.checkPageBreak(30);
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pontuação Total:', this.margin + 5, this.currentY + 8);

    this.doc.setFontSize(16);
    this.doc.setTextColor(41, 128, 185);
    const displayScore = mocaResult.adjustedScore !== undefined ? mocaResult.adjustedScore : mocaResult.totalScore;
    this.doc.text(`${displayScore}/30`, this.pageWidth - this.margin - 5, this.currentY + 8, {
      align: 'right',
    });

    if (mocaResult.educationAdjusted) {
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`(Original: ${mocaResult.totalScore} + 1 ajuste escolaridade)`, this.pageWidth - this.margin - 5, this.currentY + 13, {
        align: 'right',
      });
    }

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Interpretação:', this.margin + 5, this.currentY + 20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(mocaResult.interpretation, this.margin + 35, this.currentY + 20);

    this.currentY += 30;

    // Domain scores (similar to MMSE)
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.text('Pontuação por Domínio:', this.margin, this.currentY);
    this.currentY += 7;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    Object.entries(mocaResult.domainScores).forEach(([domain, data]) => {
      this.checkPageBreak(6);
      this.doc.text(domain, this.margin + 5, this.currentY);
      this.doc.text(`${data.score}/${data.maxScore}`, this.pageWidth - this.margin - 5, this.currentY, {
        align: 'right',
      });

      const barWidth = 40;
      const barX = this.pageWidth - this.margin - barWidth - 20;
      const barY = this.currentY - 3;
      const percentage = data.maxScore > 0 ? (data.score / data.maxScore) : 0;

      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(barX, barY, barWidth, 4);
      this.doc.setFillColor(41, 128, 185);
      this.doc.rect(barX, barY, barWidth * percentage, 4, 'F');

      this.currentY += 6;
    });

    this.currentY += 5;
  }

  /**
   * Add Clock Drawing Test results
   */
  private addClockDrawingResults(clockResult: ClockDrawingResult) {
    this.addSectionTitle('Teste do Relógio');

    // Score
    this.checkPageBreak(15);
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pontuação:', this.margin + 5, this.currentY + 7);

    this.doc.setFontSize(14);
    this.doc.setTextColor(41, 128, 185);
    this.doc.text(`${clockResult.score}/5`, this.pageWidth - this.margin - 5, this.currentY + 7, {
      align: 'right',
    });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Interpretação:', this.margin + 5, this.currentY + 12);
    this.doc.text(clockResult.interpretation, this.margin + 35, this.currentY + 12);

    this.currentY += 20;

    // Add drawing if available
    if (clockResult.drawingData) {
      this.checkPageBreak(80);
      try {
        this.doc.addImage(clockResult.drawingData, 'PNG', this.margin, this.currentY, 80, 80);
        this.currentY += 85;
      } catch (e) {
        console.error('Error adding clock drawing image:', e);
      }
    }
  }

  /**
   * Add report content
   */
  private addReportContent(report: Report) {
    if (report.conteudo) {
      if (report.conteudo.diagnostico) {
        this.addSectionTitle('Diagnóstico');
        this.addField('Principal', report.conteudo.diagnostico.principal);
        if (report.conteudo.diagnostico.secundarios?.length) {
          this.addField('Secundários', report.conteudo.diagnostico.secundarios.join(', '));
        }
        if (report.conteudo.diagnostico.cid10?.length) {
          this.addField('CID-10', report.conteudo.diagnostico.cid10.join(', '));
        }
      }

      if (report.conteudo.prognostico) {
        this.addSectionTitle('Prognóstico');
        this.addMultiLineText(report.conteudo.prognostico);
      }

      if (report.conteudo.tratamento) {
        this.addSectionTitle('Tratamento');
        if (report.conteudo.tratamento.medicamentoso) {
          this.addField('Medicamentoso', report.conteudo.tratamento.medicamentoso);
        }
        if (report.conteudo.tratamento.naoMedicamentoso) {
          this.addField('Não Medicamentoso', report.conteudo.tratamento.naoMedicamentoso);
        }
        if (report.conteudo.tratamento.acompanhamento) {
          this.addField('Acompanhamento', report.conteudo.tratamento.acompanhamento);
        }
      }

      if (report.conteudo.conclusao) {
        this.addSectionTitle('Conclusão');
        this.addMultiLineText(report.conteudo.conclusao);
      }
    }
  }

  /**
   * Add footer
   */
  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(150, 150, 150);

      // Date
      const date = new Date().toLocaleString('pt-BR');
      this.doc.text(`Gerado em: ${date}`, this.margin, this.pageHeight - 10);

      // Page number
      this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 10, {
        align: 'right',
      });

      // Separator line
      this.doc.setLineWidth(0.3);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
    }
  }

  /**
   * Helper: format gender
   */
  private formatGender(gender: string): string {
    const genderMap: Record<string, string> = {
      MALE: 'Masculino',
      FEMALE: 'Feminino',
      OTHER: 'Outro',
      PREFER_NOT_TO_SAY: 'Prefere não dizer',
    };
    return genderMap[gender] || gender;
  }

  /**
   * Generate complete evaluation report
   */
  generateEvaluationReport(
    patient: Patient,
    evaluation: Evaluation & { mmseResult?: MMSEResult; mocaResult?: MoCAResult; clockResult?: ClockDrawingResult }
  ): Blob {
    this.addHeader();
    this.addPatientInfo(patient);
    this.addEvaluationInfo(evaluation);

    if (evaluation.mmseResult) {
      this.addMMSEResults(evaluation.mmseResult);
    }

    if (evaluation.mocaResult) {
      this.addMoCAResults(evaluation.mocaResult);
    }

    if (evaluation.clockResult) {
      this.addClockDrawingResults(evaluation.clockResult);
    }

    this.addFooter();

    return this.doc.output('blob');
  }

  /**
   * Generate report with custom content
   */
  generateCustomReport(
    patient: Patient,
    evaluation: Evaluation,
    report: Report
  ): Blob {
    this.addHeader();
    this.addPatientInfo(patient);
    this.addEvaluationInfo(evaluation);
    this.addReportContent(report);
    this.addFooter();

    return this.doc.output('blob');
  }

  /**
   * Download the PDF
   */
  download(filename: string) {
    this.doc.save(filename);
  }
}

/**
 * Helper function to generate and download evaluation report
 */
export async function generateAndDownloadEvaluationReport(
  patient: Patient,
  evaluation: Evaluation & { mmseResult?: MMSEResult; mocaResult?: MoCAResult; clockResult?: ClockDrawingResult }
): Promise<void> {
  const generator = new PDFReportGenerator();
  const blob = generator.generateEvaluationReport(patient, evaluation);

  const filename = `Avaliacao_${patient.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
