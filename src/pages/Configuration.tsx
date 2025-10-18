import React from 'react';
import { Settings, User, Bell, Database } from 'lucide-react';

const Configuration: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-text border-b border-border-color pb-4 flex items-center">
        <Settings className="mr-3 text-primary" size={32} />
        Configurações do Sistema
      </h1>

      <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-color space-y-6">
        
        {/* Seção de Perfil - AGORA COM NOME E EMAIL */}
        <div className="border-b border-border-color pb-6">
          <h2 className="text-2xl font-semibold text-text mb-4 flex items-center">
            <User className="mr-2 text-secondary" size={20} />
            Perfil e Conta
          </h2>
          <p className="text-text-secondary mb-4">Gerencie suas informações pessoais e preferências de login.</p>
          
          <div className="space-y-4 max-w-md">
            {/* Campo Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
              <input
                type="text"
                id="name"
                defaultValue="Usuário Bolt"
                className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors placeholder:text-text-secondary/50"
                placeholder="Seu nome"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                id="email"
                defaultValue="usuario.bolt@stackblitz.com"
                className="w-full p-3 rounded-lg bg-background border border-border-color text-text focus:border-primary focus:ring-primary transition-colors placeholder:text-text-secondary/50"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            <button className="mt-4 w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Seção de Notificações */}
        <div className="border-b border-border-color pb-4">
          <h2 className="text-2xl font-semibold text-text mb-3 flex items-center">
            <Bell className="mr-2 text-accent" size={20} />
            Notificações
          </h2>
          <div className="flex justify-between items-center py-2">
            <span className="text-text-secondary">Receber lembretes de estudo</span>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded text-primary focus:ring-primary bg-background border-border-color" />
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-text-secondary">Alertas de progresso de meta</span>
            <input type="checkbox" className="h-5 w-5 rounded text-primary focus:ring-primary bg-background border-border-color" />
          </div>
        </div>

        {/* Seção de Dados */}
        <div>
          <h2 className="text-2xl font-semibold text-text mb-3 flex items-center">
            <Database className="mr-2 text-primary" size={20} />
            Gerenciamento de Dados
          </h2>
          <p className="text-text-secondary mb-4">Faça backup ou restaure seus dados de estudo.</p>
          <div className="flex space-x-4">
            <button className="bg-secondary text-white p-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
              Exportar Dados
            </button>
            <button className="bg-error text-white p-2 rounded-lg font-semibold hover:bg-error/80 transition-colors">
              Limpar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
