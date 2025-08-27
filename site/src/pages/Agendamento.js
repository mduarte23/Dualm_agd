import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #333;
`;

const Agendamento = () => {
  return (
    <Container>
      <Title>Agendamento</Title>
      {/* Conteúdo futuro: calendário, lista de agendamentos, filtros */}
    </Container>
  );
};

export default Agendamento;


