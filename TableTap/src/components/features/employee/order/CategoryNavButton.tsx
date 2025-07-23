import React from 'react';
import './OrderButton.css';

interface Props {
  text: string;
  color?: string; // optional override
}

function CategoryNavButton({ text, color }: Props) {
  // if color is passed, we set the CSS var; otherwise CSS will fall back
  const style = color
    ? { '--order-btn-color': color } as React.CSSProperties
    : undefined;

  return (
    <button className="OrderButton" style={style}>
      {text}
    </button>
  );
}

export default CategoryNavButton;
