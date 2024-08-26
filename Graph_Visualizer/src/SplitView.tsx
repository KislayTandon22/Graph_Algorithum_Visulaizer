import React, { useState, MouseEvent } from 'react';
import './SplitView.css';

interface SplitViewProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const SplitView: React.FC<SplitViewProps> = ({ leftContent, rightContent }) => {
  const [leftWidth, setLeftWidth] = useState<number>(50); // Initial width percentage of the left section

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + ((e.clientX - startX) / window.innerWidth) * 100;
      setLeftWidth(Math.max(10, Math.min(90, newWidth))); // Restrict width between 10% and 90%
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove as any);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove as any);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="split-view">
      <div className="left-pane" style={{ width: `${leftWidth}%` }}>
        {leftContent}
      </div>
      <div className="divider" onMouseDown={handleMouseDown} />
      <div className="right-pane" style={{ width: `${100 - leftWidth}%` }}>
        {rightContent}
      </div>
    </div>
  );
};

export default SplitView;
