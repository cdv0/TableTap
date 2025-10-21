import React from 'react';
import QRCodeGenerator from '../../../shared/components/QRCodeGenerator';

interface TableQRCodeProps {
  tableNumber: number;
  size?: number;
  showUrl?: boolean;
}

export default function TableQRCode({ 
  tableNumber, 
  size = 150, 
  showUrl = false 
}: TableQRCodeProps) {
  const getCustomerOrderUrl = (tableNumber: number) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/customer/order/${tableNumber}`;
  };

  const customerUrl = getCustomerOrderUrl(tableNumber);

  return (
    <div className="text-center">
      <div className="mb-2">
        <strong>Table {tableNumber}</strong>
      </div>
      <div className="mb-2">
        <QRCodeGenerator 
          value={customerUrl} 
          size={size}
        />
      </div>
      {showUrl && (
        <div className="mt-2">
          <small className="text-muted">
            <a 
              href={customerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              {customerUrl}
            </a>
          </small>
        </div>
      )}
    </div>
  );
}
