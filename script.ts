// patient-profile.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-profile',
  template: `
    <div class="container">
      <!-- Cabeçalho do Paciente -->
      <div class="patient-header">
        <div class="patient-avatar">
          <img src="avatar.jpg" alt="Avatar do Paciente">
        </div>
        <div class="patient-details">
          <h3>Nome do Paciente</h3>
          <p>Detalhes adicionais</p>
        </div>
      </div>

      <!-- Grid de Informações -->
      <div class="info-grid">
        <div class="info-item" *ngFor="let info of patientInfo">
          <div class="info-label">{{info.label}}</div>
          <div class="info-value">{{info.value}}</div>
        </div>
      </div>

      <!-- Testes Cognitivos -->
      <div class="tests-section">
        <h4 class="section-title">
          <i>🧠</i> Testes Cognitivos
        </h4>
        <div class="tests-grid">
          <div class="test-card" *ngFor="let test of cognitiveTests" (click)="openTest(test)">
            <div class="test-name">{{test.name}}</div>
            <div class="test-status" [ngClass]="getStatusClass(test.status)">
              {{test.status}}
            </div>
            <div class="test-score" *ngIf="test.score">{{test.score}}</div>
          </div>
        </div>
      </div>

      <!-- Avaliação de Risco -->
      <div class="risk-assessment">
        <div class="risk-level">
          <div class="risk-indicator" [ngClass]="getRiskClass(riskLevel)">
            {{riskLevel}}
          </div>
          <div class="risk-details">
            <h4>Avaliação de Risco</h4>
            <p>{{riskDescription}}</p>
          </div>
        </div>
        
        <div class="recommendations">
          <h4>Recomendações</h4>
          <ul>
            <li *ngFor="let recommendation of recommendations">
              {{recommendation}}
            </li>
          </ul>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="action-buttons">
        <button class="btn btn-primary" (click)="editPatient()">
          <span class="loading" *ngIf="loading"></span>
          Editar Perfil
        </button>
        <button class="btn btn-outline" (click)="exportData()">
          Exportar Dados
        </button>
        <button class="btn btn-danger" (click)="deletePatient()">
          Excluir
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal" [class.active]="isModalOpen">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{modalTitle}}</h3>
          <button class="close-modal" (click)="closeModal()">×</button>
        </div>
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" class="form-control" [(ngModel)]="patientName">
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }

    .patient-details h3 {
      font-size: 1.5rem;
      margin-bottom: 5px;
    }
    
    .patient-details p {
      color: var(--text-secondary);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    
    .info-item {
      margin-bottom: 15px;
    }
    
    .info-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-weight: 600;
    }
    
    /* Cognitive Tests */
    .tests-section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    
    .section-title i {
      margin-right: 10px;
    }
    
    .tests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .test-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 15px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .test-card:hover {
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    .test-name {
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .test-status {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      margin-bottom: 10px;
    }
    
    .status-completed {
      background: #e8f6f3;
      color: var(--success);
    }
    
    .status-pending {
      background: #fef9e7;
      color: var(--warning);
    }
    
    .test-score {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: right;
      color: var(--dark);
    }
    
    /* Results Visualization */
    .results-section {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .chart-container {
      height: 300px;
      margin-top: 20px;
    }
    
    /* Risk Assessment */
    .risk-assessment {
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .risk-level {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .risk-indicator {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
      margin-right: 20px;
    }
    
    .risk-low { background: var(--success); }
    .risk-medium { background: var(--warning); }
    .risk-high { background: var(--danger); }
    
    .risk-details h4 {
      margin-bottom: 10px;
    }
    
    .recommendations {
      margin-top: 20px;
    }
    
    .recommendations ul {
      padding-left: 20px;
    }
    
    .recommendations li {
      margin-bottom: 10px;
    }
    
    /* Buttons */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: var(--secondary);
      color: white;
    }
    
    .btn-primary:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid var(--secondary);
      color: var(--secondary);
    }
    
    .btn-outline:hover {
      background: var(--secondary);
      color: white;
    }
    
    .btn-danger {
      background: var(--danger);
      color: white;
    }
    
    .btn-danger:hover {
      background: #c0392b;
    }
    
    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    
    .modal.active {
      display: flex;
    }
    
    .modal-content {
      background: white;
      border-radius: 10px;
      padding: 30px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary);
    }
    
    .close-modal {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
    }
    
    /* Forms */
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--secondary);
    }
    
    /* Loading Spinner */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid var(--secondary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .patient-header {
        flex-direction: column;
        text-align: center;
      }
      
      .patient-avatar {
        margin-right: 0;
        margin-bottom: 15px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .risk-level {
        flex-direction: column;
        text-align: center;
      }
      
      .risk-indicator {
        margin-right: 0;
        margin-bottom: 15px;
      }
    }
  `]
})
export class PatientProfileComponent {
  patientInfo = [
    { label: 'Idade', value: '45 anos' },
    { label: 'Gênero', value: 'Masculino' },
    { label: 'Última Consulta', value: '15/03/2024' }
  ];

  cognitiveTests = [
    { name: 'Teste de Memória', status: 'completed', score: 85 },
    { name: 'Teste de Atenção', status: 'pending' },
    { name: 'Teste de Linguagem', status: 'completed', score: 92 }
  ];

  riskLevel: 'low' | 'medium' | 'high' = 'medium';
  riskDescription = 'Paciente apresenta risco moderado de declínio cognitivo';
  recommendations = [
    'Acompanhamento mensal',
    'Exercícios cognitivos diários',
    'Avaliação nutricional'
  ];

  isModalOpen = false;
  modalTitle = '';
  patientName = '';
  loading = false;

  getStatusClass(status: string): string {
    return status === 'completed' ? 'status-completed' : 'status-pending';
  }

  getRiskClass(risk: string): string {
    return `risk-${risk}`;
  }

  openTest(test: any): void {
    console.log('Abrir teste:', test);
    this.modalTitle = test.name;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  editPatient(): void {
    this.loading = true;
    // Simular operação assíncrona
    setTimeout(() => {
      this.loading = false;
      this.modalTitle = 'Editar Paciente';
      this.isModalOpen = true;
    }, 1000);
  }

  exportData(): void {
    console.log('Exportando dados...');
  }

  deletePatient(): void {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      console.log('Paciente excluído');
    }
  }
}
Opção 2: Arquivo CSS separado com tipos TypeScript
patient-profile.component.ts:

typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent {
  // ... mesma lógica do componente acima
}
patient-profile.component.css:

css
/* Mantenha todo o CSS original aqui */
Interface para tipagem (opcional):

typescript
// interfaces/patient.interface.ts
export interface Patient {
  id: number;
  name: string;
  age: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CognitiveTest {
  id: number;
  name: string;
  status: 'completed' | 'pending';
  score?: number;
  date: Date;
}