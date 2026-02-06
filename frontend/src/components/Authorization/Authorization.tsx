import React, { useState } from 'react';
import './Authorization.css';

interface PilotLicense {
  licenseNumber: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'pending';
}

const Authorization: React.FC = () => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<PilotLicense | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const verifyLicense = async () => {
    setIsVerifying(true);
    setError('');
    setVerificationResult(null);

    // Simulate API call to verify pilot license
    setTimeout(() => {
      if (licenseNumber.length < 5) {
        setError('Neplatné číslo licence. Zadejte platné číslo.');
        setIsVerifying(false);
        return;
      }

      // Mock verification result
      const mockResult: PilotLicense = {
        licenseNumber: licenseNumber,
        category: 'A1/A3',
        issueDate: '2024-03-15',
        expiryDate: '2029-03-15',
        status: 'valid'
      };

      setVerificationResult(mockResult);
      setIsVerifying(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return '#4caf50';
      case 'expired':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Platná';
      case 'expired':
        return 'Vypršela';
      case 'pending':
        return 'Čeká na schválení';
      default:
        return status;
    }
  };

  return (
    <div className="authorization">
      <h2>Kontrola oprávnění k pilotování dronů</h2>

      <div className="info-section">
        <p>
          Pro provozování dronů v České republice je nutné mít platnou licenci pilota dle nařízení EU.
          Zadejte číslo vaší licence pro ověření oprávnění.
        </p>
      </div>

      <div className="verification-form">
        <div className="form-group">
          <label htmlFor="licenseNumber">Číslo pilotní licence:</label>
          <input
            type="text"
            id="licenseNumber"
            placeholder="Např. CZ-RPAS-A1A3-123456"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            disabled={isVerifying}
          />
        </div>

        <button 
          onClick={verifyLicense}
          disabled={isVerifying || !licenseNumber}
          className="verify-button"
        >
          {isVerifying ? 'Ověřuji...' : 'Ověřit licenci'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {verificationResult && (
        <div className="verification-result">
          <div className="result-header">
            <h3>Výsledek ověření</h3>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(verificationResult.status) }}
            >
              {getStatusLabel(verificationResult.status)}
            </span>
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">Číslo licence:</span>
              <span className="value">{verificationResult.licenseNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Kategorie:</span>
              <span className="value">{verificationResult.category}</span>
            </div>
            <div className="detail-row">
              <span className="label">Datum vydání:</span>
              <span className="value">{verificationResult.issueDate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Platnost do:</span>
              <span className="value">{verificationResult.expiryDate}</span>
            </div>
          </div>

          {verificationResult.status === 'valid' && (
            <div className="success-message">
              ✓ Máte platné oprávnění k pilotování dronů
            </div>
          )}

          {verificationResult.status === 'expired' && (
            <div className="warning-message">
              ⚠ Vaše licence vypršela. Pro provozování dronů je nutné obnovit licenci.
            </div>
          )}
        </div>
      )}

      <div className="requirements-section">
        <h3>Požadavky na provozování dronů</h3>
        <ul>
          <li>Platná pilotní licence pro kategorii A1/A3 nebo vyšší</li>
          <li>Registrace dronu u Úřadu pro civilní letectví (ÚCL)</li>
          <li>Pojištění odpovědnosti za škody</li>
          <li>Znalost legislativy a bezpečnostních pravidel</li>
          <li>Dodržování omezení létání v kontrolovaných oblastech</li>
        </ul>
      </div>
    </div>
  );
};

export default Authorization;
