import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const AboutTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const AboutSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
`;

const ContentSection = styled.section`
  background: var(--surface-bg);
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #667eea;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const SectionText = styled.p`
  color: #555;
  line-height: 1.7;
  margin-bottom: 1rem;
`;

const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const TechItem = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #667eea;
`;

const TechName = styled.h4`
  color: #333;
  margin-bottom: 0.5rem;
`;

const TechDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const About = () => {
  return (
    <AboutContainer>
      <AboutHeader>
        <AboutTitle>Sobre o Dualm</AboutTitle>
        <AboutSubtitle>
          Uma plataforma moderna e inovadora para desenvolvimento e gerenciamento de projetos
        </AboutSubtitle>
      </AboutHeader>

      <ContentSection>
        <SectionTitle>Nossa Missão</SectionTitle>
        <SectionText>
          O Dualm nasceu da necessidade de criar uma solução completa e integrada para 
          desenvolvedores e equipes que buscam eficiência, qualidade e inovação em seus projetos.
        </SectionText>
        <SectionText>
          Nossa plataforma combina as melhores práticas de desenvolvimento com tecnologias 
          de ponta, oferecendo uma experiência única e produtiva.
        </SectionText>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Tecnologias Utilizadas</SectionTitle>
        <SectionText>
          Desenvolvemos o Dualm utilizando as tecnologias mais modernas e confiáveis do mercado:
        </SectionText>
        <TechStack>
          <TechItem>
            <TechName>React</TechName>
            <TechDescription>Interface moderna e responsiva</TechDescription>
          </TechItem>
          <TechItem>
            <TechName>Node.js</TechName>
            <TechDescription>Backend robusto e escalável</TechDescription>
          </TechItem>
          <TechItem>
            <TechName>Python</TechName>
            <TechDescription>APIs e processamento de dados</TechDescription>
          </TechItem>
          <TechItem>
            <TechName>Styled Components</TechName>
            <TechDescription>Estilização moderna e componentizada</TechDescription>
          </TechItem>
        </TechStack>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Nossos Valores</SectionTitle>
        <SectionText>
          <strong>Inovação:</strong> Sempre buscamos as melhores soluções e tecnologias.
        </SectionText>
        <SectionText>
          <strong>Qualidade:</strong> Compromisso com a excelência em cada linha de código.
        </SectionText>
        <SectionText>
          <strong>Colaboração:</strong> Acreditamos no poder do trabalho em equipe.
        </SectionText>
        <SectionText>
          <strong>Sustentabilidade:</strong> Desenvolvimento responsável e eficiente.
        </SectionText>
      </ContentSection>
    </AboutContainer>
  );
};

export default About;
