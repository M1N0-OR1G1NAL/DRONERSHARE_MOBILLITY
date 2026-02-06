import React, { useState } from 'react';
import './Legislative.css';

interface FlightZone {
  name: string;
  type: 'allowed' | 'restricted' | 'prohibited';
  description: string;
}

interface LegislativeCheck {
  droneWeight: number;
  flightAltitude: number;
  location: string;
  hasInsurance: boolean;
  hasPilotLicense: boolean;
}

const Legislative: React.FC = () => {
  const [checkData, setCheckData] = useState<LegislativeCheck>({
    droneWeight: 0,
    flightAltitude: 0,
    location: '',
    hasInsurance: false,
    hasPilotLicense: false
  });

  const [checkResult, setCheckResult] = useState<{
    isCompliant: boolean;
    issues: string[];
    warnings: string[];
  } | null>(null);

  const performCheck = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Weight check
    if (checkData.droneWeight > 25) {
      issues.push('Dron přesahuje maximální povolenou hmotnost 25 kg pro kategorii Open');
    }

    // Altitude check
    if (checkData.flightAltitude > 120) {
      issues.push('Maximální povolená výška letu je 120 metrů nad terénem');
    }

    // Insurance check
    if (!checkData.hasInsurance) {
      issues.push('Povinné pojištění odpovědnosti za škody není aktivní');
    }

    // License check
    if (!checkData.hasPilotLicense) {
      issues.push('Chybí platná pilotní licence pro kategorii provozu');
    }

    // Location check (simplified)
    const restrictedAreas = ['letiště', 'airport', 'vojenský'];
    if (restrictedAreas.some(area => checkData.location.toLowerCase().includes(area))) {
      issues.push('Vybraná lokace je v zakázané nebo omezené zóně');
    }

    // Warnings
    if (checkData.droneWeight > 4 && checkData.droneWeight <= 25) {
      warnings.push('Pro drony nad 4 kg je vyžadována vyšší kategorie pilotní licence');
    }

    if (checkData.flightAltitude > 50) {
      warnings.push('Let ve výšce nad 50 m může vyžadovat dodatečné bezpečnostní opatření');
    }

    setCheckResult({
      isCompliant: issues.length === 0,
      issues,
      warnings
    });
  };

  const zones: FlightZone[] = [
    {
      name: 'Otevřená zóna',
      type: 'allowed',
      description: 'Let bez speciálního povolení, maximálně 120 m výška, kategorie A1/A3'
    },
    {
      name: 'Omezená zóna',
      type: 'restricted',
      description: 'Vyžaduje předchozí oznámení nebo povolení od řídícího orgánu'
    },
    {
      name: 'Zakázaná zóna',
      type: 'prohibited',
      description: 'Let zakázán (letiště, vojenské objekty, kritická infrastruktura)'
    }
  ];

  return (
    <div className="legislative">
      <h2>Legislativní kontrola</h2>

      <div className="info-section">
        <h3>Legislativní rámec EU pro drony</h3>
        <p>
          Od 31. prosince 2020 platí v celé EU nová pravidla pro provozování dronů 
          podle nařízení (EU) 2019/947. Před každým letem je nutné ověřit shodu s legislativou.
        </p>
      </div>

      <div className="flight-zones">
        <h3>Letové zóny</h3>
        <div className="zones-grid">
          {zones.map((zone, idx) => (
            <div key={idx} className={`zone-card ${zone.type}`}>
              <div className="zone-header">
                <span className="zone-indicator"></span>
                <h4>{zone.name}</h4>
              </div>
              <p>{zone.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="compliance-check">
        <h3>Kontrola shody</h3>
        
        <div className="check-form">
          <div className="form-group">
            <label htmlFor="droneWeight">Hmotnost dronu (kg):</label>
            <input
              type="number"
              id="droneWeight"
              min="0"
              max="50"
              step="0.1"
              value={checkData.droneWeight}
              onChange={(e) => setCheckData({ 
                ...checkData, 
                droneWeight: parseFloat(e.target.value) || 0 
              })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="flightAltitude">Plánovaná výška letu (m):</label>
            <input
              type="number"
              id="flightAltitude"
              min="0"
              max="200"
              value={checkData.flightAltitude}
              onChange={(e) => setCheckData({ 
                ...checkData, 
                flightAltitude: parseInt(e.target.value) || 0 
              })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Lokace letu:</label>
            <input
              type="text"
              id="location"
              placeholder="Např. Praha - Letná"
              value={checkData.location}
              onChange={(e) => setCheckData({ 
                ...checkData, 
                location: e.target.value 
              })}
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={checkData.hasInsurance}
                onChange={(e) => setCheckData({ 
                  ...checkData, 
                  hasInsurance: e.target.checked 
                })}
              />
              Mám platné pojištění odpovědnosti
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={checkData.hasPilotLicense}
                onChange={(e) => setCheckData({ 
                  ...checkData, 
                  hasPilotLicense: e.target.checked 
                })}
              />
              Mám platnou pilotní licenci
            </label>
          </div>

          <button onClick={performCheck} className="check-button">
            Provést kontrolu shody
          </button>
        </div>

        {checkResult && (
          <div className="check-result">
            <div className={`result-header ${checkResult.isCompliant ? 'compliant' : 'non-compliant'}`}>
              <h4>
                {checkResult.isCompliant 
                  ? '✓ Let splňuje legislativní požadavky' 
                  : '✗ Let nesplňuje legislativní požadavky'}
              </h4>
            </div>

            {checkResult.issues.length > 0 && (
              <div className="issues-section">
                <h5>Problémy k vyřešení:</h5>
                <ul>
                  {checkResult.issues.map((issue, idx) => (
                    <li key={idx} className="issue-item">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {checkResult.warnings.length > 0 && (
              <div className="warnings-section">
                <h5>Upozornění:</h5>
                <ul>
                  {checkResult.warnings.map((warning, idx) => (
                    <li key={idx} className="warning-item">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {checkResult.isCompliant && (
              <div className="compliance-message">
                <p>✓ Můžete pokračovat k provedení letu</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="requirements-list">
        <h3>Základní požadavky pro legální provoz</h3>
        <ul>
          <li>Registrace dronu u Úřadu pro civilní letectví (ÚCL) pro drony nad 250 g</li>
          <li>Platná pilotní licence (minimálně A1/A3)</li>
          <li>Pojištění odpovědnosti za škody</li>
          <li>Dodržování maximální výšky letu 120 m</li>
          <li>Respektování zakázaných a omezených zón</li>
          <li>Nelétat nad lidmi a skupinami lidí</li>
          <li>Udržování vizuálního kontaktu s dronem (VLOS)</li>
          <li>Létání pouze ve dne (pokud nemáte speciální povolení)</li>
        </ul>
      </div>
    </div>
  );
};

export default Legislative;
