import { useState } from 'react';

interface KeypadProps {
  initialValue?: string;
  onSubmit?: (value: string) => void;
}

function Keypad({ initialValue = '', onSubmit }: KeypadProps) {
    const [input, setInput] = useState(initialValue);

    // handles press events: adding numbers to display box, submit button, back button
    const handlePress = (value: string | number) => {
        if (value === 'back') {
            setInput((prev) => prev.slice(0, -1));
        } else if (value === 'submit') {
            onSubmit?.(input);
            setInput('');
        } else {
            setInput((prev) => prev + value.toString());
        }
    };

    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'back', 0, 'submit'];

    return (
        <div className="d-flex flex-column align-items-center mt-4">
            {/* display box */}
            <div className="form-control text-end mb-4 mt-4 fs-4 bg-white shadow-sm" style={{ width: '260px', height: '60px' }}>
                {Array(input.length).fill('•').join('')}
            </div>
        
            {/* grid for the keys */}
            <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid', }}>
                {keys.map((key) => (
                    <button key={key} className="btn btn-light fw-semi-bold rounded-circle fs-2 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }} onClick={() => handlePress(key)}>
                        {key === 'back' ? '←' : key === 'submit' ? '→' : key}
                    </button>
            ))}
            </div>
        </div>
  );
}

export default Keypad;