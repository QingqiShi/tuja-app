import { useRef, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import styled from 'styled-components';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import useSize from '../../hooks/useSize';
import { v } from '../../theme';
import { StyledButton } from './ButtonBase';

const HEIGHT = '1.3rem';
const THUMB_WIDTH = '2.5rem';

const Container = styled.div`
  width: 300px;
  height: ${HEIGHT};
  display: flex;
  align-items: center;
  position: relative;
`;

const Track = styled.div`
  width: 100%;
  height: 0.4rem;
  border-radius: 0.2rem;
  background: ${v.textSecondary};
  overflow: hidden;
`;

const Progress = styled.div`
  width: 0;
  height: 100%;
  background-color: ${v.accentHover};
`;

const ThumbContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: ${THUMB_WIDTH};
  height: ${HEIGHT};
`;

const Thumb = motion<
  Omit<React.ComponentProps<'div'>, 'onDrag' | 'onDragStart' | 'onDragEnd'> & {
    isTabFocused?: boolean;
  }
>(styled(StyledButton)
  .withConfig({
    shouldForwardProp: (p) =>
      !['onDrag', 'onDragStart', 'onDragEnd', 'isTabFocused'].includes(p),
  })
  .attrs(() => ({ as: 'div' }))`
  position: absolute;
  left: 0;
  padding: 0;
  justify-content: center;
  height: ${HEIGHT};
  width: ${THUMB_WIDTH};
  color: ${v.textOnAccent};
  background-color: ${v.accentMain};
  box-shadow: ${v.shadowRaised};
  will-change: transform;

  &:hover {
    color: ${v.textOnAccent};
    background-color: ${v.accentHover};
  }
  &:active {
    background-color: ${v.accentMain};
    box-shadow: ${v.shadowPressed};
  }

  &:before, &:after {
    content: '';
    border-left: 2px solid rgba(255, 255, 255, 0.4);
    height: 50%;
  }

  &:before {
    margin-right: 3px;
  }
`);

interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  stepCount?: number;
  className?: string;
  id?: string;
  name?: string;
  onChange?: (newVal: number) => void;
}

function Slider({
  value = 0,
  min = 0,
  max = 100,
  stepCount = 100,
  className,
  id,
  name,
  onChange,
}: SliderProps) {
  const [thumbContainerEl, setThumbContainerEl] =
    useState<Element | null>(null);
  const thumbContainerRect = useSize(thumbContainerEl);
  const [thumbRef, isTabFocused] = useKeyboardFocus();
  const dragConstraintRef = useRef<HTMLDivElement>(null);

  const [startDragValue, setStartDragValue] = useState(0);

  const thumbPosition =
    ((value - min) / (max - min)) * thumbContainerRect.width;

  const step = (max - min) / stepCount;

  const getValue = (offset: number) => {
    const newValue =
      startDragValue + ((max - min) * offset) / (thumbContainerRect.width || 1);
    return Math.min(Math.max(newValue, min), max);
  };

  const roundValue = (val: number) =>
    Math.round((val * stepCount) / (max - min)) * step;

  return (
    <Container className={className} ref={dragConstraintRef}>
      <input type="hidden" value={value} id={id} name={name} />
      <Track>
        <Progress
          style={{ width: `calc(${thumbPosition}px + ${THUMB_WIDTH} / 2)` }}
        />
      </Track>
      <ThumbContainer
        ref={setThumbContainerEl}
        data-testid="slider-thumb-container"
      >
        <Thumb
          data-testid="slider-thumb"
          ref={thumbRef as any}
          isTabFocused={isTabFocused}
          tabIndex={0}
          role="slider"
          aria-orientation="horizontal"
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={value}
          drag="x"
          dragConstraints={dragConstraintRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => {
            setStartDragValue(value);
          }}
          onDrag={(_: any, info: PanInfo) =>
            onChange && onChange(getValue(info.offset.x))
          }
          onDragEnd={() => onChange && onChange(roundValue(value))}
          style={{ left: thumbPosition }}
          layout
          onKeyDown={(e) => {
            // Left
            if (onChange && e.key === 'ArrowLeft') {
              onChange(Math.min(Math.max(value - step, min), max));
            }

            // Right
            if (onChange && e.key === 'ArrowRight') {
              onChange(Math.min(Math.max(value + step, min), max));
            }
          }}
        />
      </ThumbContainer>
    </Container>
  );
}

export default Slider;
