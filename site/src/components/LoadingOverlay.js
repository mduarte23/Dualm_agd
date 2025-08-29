import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLoading } from '../contexts/LoadingContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.15s ease-out;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 6px solid #ffffff;
  border-top-color: #1e90ff;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  box-shadow: 0 0 10px rgba(30, 144, 255, 0.6);
`;

const LoadingOverlay = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return (
    <Backdrop>
      <Spinner />
    </Backdrop>
  );
};

export default LoadingOverlay;


