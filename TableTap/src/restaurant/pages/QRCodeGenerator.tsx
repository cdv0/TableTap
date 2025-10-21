import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeGenerator from '../../shared/components/QRCodeGenerator';
import { useTablesData } from '../../shared/hooks/useTablesData';
import Navbar from '../components/global/Navbar';
import Sidebar from '../components/global/Sidebar';

export default function QRCodeGeneratorPage() {
  const navigate = useNavigate();
  const { tables, isLoading, error } = useTablesData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get the base URL for the customer ordering page
  const getCustomerOrderUrl = (tableNumber: number) => {
    // You can customize this URL based on your deployment
    const baseUrl = window.location.origin;
    return `${baseUrl}/customer/order/${tableNumber}`;
  };


  const handleDownloadQR = (tableNumber: number) => {
    const url = getCustomerOrderUrl(tableNumber);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = 200;
      canvas.height = 200;
      
      // Generate QR code
      import('qrcode').then(QRCode => {
        QRCode.toCanvas(canvas, url, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        }, () => {
          // Download the canvas as PNG
          const link = document.createElement('a');
          link.download = `table-${tableNumber}-qr-code.png`;
          link.href = canvas.toDataURL();
          link.click();
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div>Loading tables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-danger">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar
        heading="QR Code Generator"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="container-fluid p-4">
        <div className="row">
          <div className="col-12">
            <h2 className="mb-4">Table QR Codes</h2>
            <p className="text-muted mb-4">
              Generate QR codes for each table to allow customers to order directly.
            </p>
          </div>
        </div>

        <div className="row">
          {tables.map((table) => {
            const customerUrl = getCustomerOrderUrl(table.number);
            return (
              <div key={table.id} className="col-md-4 col-lg-3 mb-4">
                <div className="card">
                  <div className="card-body text-center">
                    <h5 className="card-title">Table {table.number}</h5>
                    <div className="mb-3">
                      <QRCodeGenerator 
                        value={customerUrl} 
                        size={150}
                        style={{ margin: '0 auto' }}
                      />
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">
                        Status: <span className={`badge ${table.isOccupied ? 'bg-danger' : 'bg-success'}`}>
                          {table.isOccupied ? 'Occupied' : 'Available'}
                        </span>
                      </small>
                    </div>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDownloadQR(table.number)}
                      >
                        Download PNG
                      </button>
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(customerUrl);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        Copy URL
                      </button>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        URL: {customerUrl}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tables.length === 0 && (
          <div className="text-center py-5">
            <h4>No tables found</h4>
            <p className="text-muted">Add tables in the Tables section first.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/restaurant/tables')}
            >
              Go to Tables
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
