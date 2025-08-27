import React, { useState } from 'react';
import { useStackNav } from '../contexts/StackNav';
import styled from 'styled-components';
import authService from '../services/authService';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ForgotPassword = styled.a`
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 1rem;
  display: inline-block;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #363;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid #cfc;
`;

const LoadingMessage = styled.div`
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid #bbdefb;
`;

const Home = () => {
  const { setCurrentPage } = useStackNav();
  const [formData, setFormData] = useState({
    domain: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStep, setLoadingStep] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar mensagens de erro ao digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setLoadingStep('');

    // Validação básica
    if (!formData.domain || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    try {
      // Limpar domínio (remover http/https e www se existir)
      const cleanDomain = formData.domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      setLoadingStep('Consultando domínio...');
      
      // Fazer login usando o serviço de autenticação
      const loginResult = await authService.login(
        cleanDomain,
        formData.email,
        formData.password
      );

      setLoadingStep('Login realizado com sucesso!');
      setSuccess(`Bem-vindo, ${loginResult.user.name || loginResult.user.email}! Redirecionando...`);
      
      // Redirecionar para o Dashboard (URL fica na raiz)
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
      setLoadingStep('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>Dualm</Logo>
        <Subtitle>Faça login para acessar sua conta</Subtitle>
        
        <LoginForm onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {loadingStep && <LoadingMessage>{loadingStep}</LoadingMessage>}
          
          <FormGroup>
            <Label htmlFor="domain">Domínio *</Label>
            <Input
              type="text"
              id="domain"
              name="domain"
              placeholder="exemplo.com"
              value={formData.domain}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha *</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </LoginButton>
        </LoginForm>

        <ForgotPassword href="#">
          Esqueceu sua senha?
        </ForgotPassword>
      </LoginCard>
    </LoginContainer>
  );
};

export default Home;
