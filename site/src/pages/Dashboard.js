import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const WelcomeSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-left: 4px solid #667eea;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const RecentActivity = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const ActivityList = styled.ul`
  list-style: none;
`;

const ActivityItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.2rem;
`;

const ActivityTime = styled.div`
  font-size: 0.9rem;
  color: #999;
`;

const Dashboard = () => {
  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Bem-vindo de volta!</WelcomeTitle>
        <WelcomeSubtitle>
          Aqui está um resumo das suas atividades recentes
        </WelcomeSubtitle>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatNumber>12</StatNumber>
          <StatLabel>Projetos Ativos</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>8</StatNumber>
          <StatLabel>Tarefas Pendentes</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>95%</StatNumber>
          <StatLabel>Taxa de Conclusão</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>24</StatNumber>
          <StatLabel>Horas Trabalhadas</StatLabel>
        </StatCard>
      </StatsGrid>

      <RecentActivity>
        <SectionTitle>Atividades Recentes</SectionTitle>
        <ActivityList>
          <ActivityItem>
            <ActivityIcon>📝</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Novo projeto criado</ActivityTitle>
              <ActivityTime>Há 2 horas</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>✅</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Tarefa "Configurar API" concluída</ActivityTitle>
              <ActivityTime>Há 4 horas</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>👥</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Novo membro adicionado ao projeto</ActivityTitle>
              <ActivityTime>Há 1 dia</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>🔧</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Deploy realizado com sucesso</ActivityTitle>
              <ActivityTime>Há 2 dias</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;
