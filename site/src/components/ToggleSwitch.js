import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  user-select: none;
`;

const Track = styled.span`
  position: relative;
  width: 48px;
  height: 26px;
  background: ${p => (p.$checked ? '#6366f1' : '#e5e7eb')};
  border-radius: 999px;
  transition: background 0.2s ease;
  display: inline-block;
`;

const Knob = styled.span`
  position: absolute;
  top: 3px;
  left: ${p => (p.$checked ? '24px' : '3px')};
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  position: absolute;
  opacity: 0;
  width: 0; height: 0;
`;

const ToggleSwitch = ({ checked, onChange, labelOn = 'Ativo', labelOff = 'Inativo' }) => {
  return (
    <Wrapper>
      <HiddenCheckbox checked={checked} onChange={e => onChange?.(e.target.checked)} />
      <Track $checked={checked}>
        <Knob $checked={checked} />
      </Track>
      <span style={{ color: '#6b7280' }}>{checked ? labelOn : labelOff}</span>
    </Wrapper>
  );
};

export default ToggleSwitch;


