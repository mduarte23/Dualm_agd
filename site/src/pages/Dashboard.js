import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import authService from '../services/authService';

const DashboardContainer = styled.div`
  padding: 2rem 0;
`;

const WelcomeSection = styled.div`
  background: var(--surface-bg);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: var(--muted);
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--surface-bg);
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
  color: var(--muted);
  font-size: 0.9rem;
`;

const RecentActivity = styled.div`
  background: var(--surface-bg);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
`;

const ActivityList = styled.ul`
  list-style: none;
`;

const ActivityItem = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
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
  background: var(--panel-bg);
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
  color: var(--text-primary);
  margin-bottom: 0.2rem;
`;

const ActivityTime = styled.div`
  font-size: 0.9rem;
  color: var(--muted);
`;

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  font-weight: 700;
`;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agendamentos, setAgendamentos] = useState([]);
  const [stats, setStats] = useState({ hoje: 0, semana: 0, mes: 0, futuros: 0, porMedico: [] });
  const API_BASE_URL = process.env.REACT_APP_API_URL || axios.defaults.baseURL || 'http://localhost:5000';

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const dominio = authService.getCurrentClient()?.dominio;
        const res = await axios.get(`${API_BASE_URL}/agendamentos`, { params: { dominio } });
        const data = res.data || {};
        const items = Array.isArray(data.agendamentos) ? data.agendamentos : [];
        setAgendamentos(items);
        // calcular stats
        const todayKey = new Date().toISOString().slice(0,10);
        const agora = new Date();
        const firstDayOfWeek = new Date(agora);
        firstDayOfWeek.setDate(agora.getDate() - ((agora.getDay() + 6) % 7));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        const firstDayOfMonth = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const lastDayOfMonth = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
        const inRange = (d, a, b) => {
          const dt = new Date(d);
          return dt >= a && dt <= b;
        };
        const sHoje = items.filter(i => (i.data_agendamento || '').slice(0,10) === todayKey).length;
        const sSemana = items.filter(i => inRange((i.data_agendamento || '').slice(0,10), firstDayOfWeek, lastDayOfWeek)).length;
        const sMes = items.filter(i => inRange((i.data_agendamento || '').slice(0,10), firstDayOfMonth, lastDayOfMonth)).length;
        const sFuturos = items.filter(i => {
          const dateStr = (i.data_agendamento || '').slice(0,10);
          if (!dateStr) return false;
          const timeStr = (i.horario || '00:00').toString().slice(0,5);
          const dt = new Date(`${dateStr}T${timeStr}:00`);
          return dt >= agora;
        }).length;
        const porMed = Object.values(items.reduce((acc, it) => {
          const key = it.id_especialista;
          if (!acc[key]) acc[key] = { nome: it.nome_especialista || 'Médico', total: 0 };
          acc[key].total += 1;
          return acc;
        }, {}));
        setStats({ hoje: sHoje, semana: sSemana, mes: sMes, futuros: sFuturos, porMedico: porMed.sort((a,b) => b.total - a.total).slice(0,5) });
      } catch (e) {
        setError(e.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Dashboard</WelcomeTitle>
        <WelcomeSubtitle>Resumo dos agendamentos e ações rápidas</WelcomeSubtitle>
        <QuickActions>
          <ActionButton onClick={() => window.dispatchEvent(new CustomEvent('stacknav:set', { detail: { page: 'agendamento' } }))}>+ Novo agendamento</ActionButton>
          <ActionButton onClick={() => window.dispatchEvent(new CustomEvent('stacknav:set', { detail: { page: 'cliente' } }))}>+ Novo cliente</ActionButton>
          <ActionButton onClick={() => window.dispatchEvent(new CustomEvent('stacknav:set', { detail: { page: 'especialistas' } }))}>+ Novo especialista</ActionButton>
        </QuickActions>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.hoje}</StatNumber>
          <StatLabel>Agendamentos hoje</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.semana}</StatNumber>
          <StatLabel>Agendamentos na semana</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.mes}</StatNumber>
          <StatLabel>Agendamentos no mês</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.futuros}</StatNumber>
          <StatLabel>Agendamentos futuros</StatLabel>
        </StatCard>
      </StatsGrid>

      <RecentActivity>
        <SectionTitle>Próximos agendamentos</SectionTitle>
        {loading ? 'Carregando...' : error ? (<div style={{ color: '#b91c1c' }}>{error}</div>) : (
          <ActivityList>
            {agendamentos.slice(0,8).map(a => (
              <ActivityItem key={a.id_agendamento}>
                <ActivityIcon>🗓️</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{(a.data_agendamento || '').slice(0,10)} • {(a.horario || '').toString().slice(0,5)}</ActivityTitle>
                  <ActivityTime>{a.nome_especialista || 'Especialista'} • Duração: {a.duracao ? `${a.duracao}m` : '-'}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;
