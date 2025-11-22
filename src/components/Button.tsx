import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Button = ({ onClick, className, children, disabled = false }: ButtonProps) => {
  return (
    <StyledWrapper>
      <div 
        className={`button ${className || ''} ${disabled ? 'disabled' : ''}`} 
        onClick={!disabled ? onClick : undefined}
      >
        <div className="button-wrapper">
          <div className="text">{children || 'Lập kế hoạch'}</div>
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    --width: 150px;
    --height: 40px;
    --button-color: white;
    --tooltip-color: #fff;
    width: var(--width);
    height: var(--height);
    background: var(--button-color);
    position: relative;
    text-align: center;
    border-radius: 10px;
    font-family: "Arial";
    transition: all 0.3s;
    border-top: 2px solid #EA4335;
    border-right: 2px solid #4285F4;
    border-bottom: 2px solid #34A853;
    border-left: 2px solid #FBBC05;
    font-size: 18px;
    font-weight: bold;
    color: rgba(0, 29, 53, 0.7);
    margin: 10px auto;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .button::before {
    position: absolute;
    content: attr(data-tooltip);
    width: var(--tooltip-width);
    height: var(--tooltip-height);
    background-color: var(--tooltip-color);
    font-size: 0.9rem;
    color: #111;
    border-radius: .25em;
    line-height: var(--tooltip-height);
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px);
    left: calc(50% - var(--tooltip-width) / 2);
  }

  .button::after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: var(--tooltip-color);
    left: calc(50% - 10px);
    bottom: calc(100% + var(--gap-between-tooltip-to-button) - 10px);
  }

  .button::after,.button::before {
    opacity: 0;
    visibility: hidden;
    transition: all 0.5s;
  }

  .text {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-wrapper,.text,.icon {
    overflow: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    color: rgba(0, 29, 53, 0.7);
  }

  .text {
    top: 0
  }

  .text,.icon {
    transition: top 0.5s;
  }

  .icon {
    color: #fb923c;
    top: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon svg {
    width: 24px;
    height: 24px;
  }

  .button:hover {
    background: #FFF8F0;
  }

  .button:hover .text {
    top: -100%;
  }

  .button:hover .icon {
    top: 0;
  }

  .button:hover:before,.button:hover:after {
    opacity: 1;
    visibility: visible;
  }

  .button:hover:after {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px);
  }

  .button:hover:before {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button));
  }

  .button.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }`;

export default Button;
