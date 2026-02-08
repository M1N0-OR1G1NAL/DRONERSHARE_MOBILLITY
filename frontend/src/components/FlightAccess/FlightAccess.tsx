import React, { useState, useEffect, useCallback } from 'react';
import './FlightAccess.css';

interface FlightAccessProps {
  // API base URL can be passed as prop or use environment variable
  apiUrl?: string;
}

interface UserData {
  tier: number;
  tierDescription: string;
  email: string;
  firstName: string;
  lastName: string;
  onboardingCompletedAt?: string;
  tierNotes?: string;
  services?: {
    route_automation: boolean;
    manual_operation: boolean;
    freight_handling: boolean;
  };
  enabledServices?: string[];
}

const FlightAccess: React.FC<FlightAccessProps> = ({ apiUrl = 'http://localhost:3000' }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [togglingService, setTogglingService] = useState<string | null>(null);

  // Mock authentication token - in production, this should come from auth context/state
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/flight-access`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }

      const data = await response.json();
      setUserData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    if (authToken) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [authToken, loadDashboard]);

  const handleElevateTier = async (targetTier: number) => {
    try {
      setUpgrading(true);
      const response = await fetch(`${apiUrl}/api/flight-access/elevate/${targetTier}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to elevate tier');
      }

      const result = await response.json();
      alert(result.message);
      await loadDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to elevate tier');
    } finally {
      setUpgrading(false);
    }
  };

  const handleToggleService = async (service: string) => {
    try {
      setTogglingService(service);
      const response = await fetch(`${apiUrl}/api/flight-access/service/${service}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle service');
      }

      await response.json();
      await loadDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle service');
    } finally {
      setTogglingService(null);
    }
  };

  const renderTier0Content = () => (
    <div className="tier-content tier-0">
      <h2>🌟 Vítejte v Drontylity</h2>
      <div className="welcome-section">
        <p className="tier-description">
          Jste <strong>Prospective Visitor</strong> - Prozkoumejte naši platformu!
        </p>
        <div className="features-preview">
          <h3>Co nabízíme:</h3>
          <ul>
            <li>🚁 <strong>Automatizované taxi drony</strong> - Rychlá přeprava z bodu A do B</li>
            <li>✈️ <strong>Manuální pronájem</strong> - Pilotujte si drona sami</li>
            <li>📦 <strong>Nákladní přeprava</strong> - Logistika balíků vzduchem</li>
          </ul>
        </div>
        <div className="upgrade-section">
          <h3>Připraveni začít?</h3>
          <p>Upgradem na Active Subscriber získáte přístup ke všem našim službám!</p>
          <button 
            className="btn-primary btn-upgrade"
            onClick={() => handleElevateTier(1)}
            disabled={upgrading}
          >
            {upgrading ? 'Probíhá upgrade...' : '🚀 Upgradeovat na Subscriber'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTier1Content = () => (
    <div className="tier-content tier-1">
      <h2>🎯 Ovládací Panel Služeb</h2>
      <div className="subscriber-section">
        <p className="tier-description">
          Vítejte, <strong>Active Subscriber</strong>! Spravujte své služby níže.
        </p>
        {userData?.onboardingCompletedAt && (
          <p className="onboarding-date">
            Člen od: {new Date(userData.onboardingCompletedAt).toLocaleDateString('cs-CZ')}
          </p>
        )}
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-header">
              <h3>🚁 Route Automation</h3>
              <span className={`status-badge ${userData?.services?.route_automation ? 'active' : 'inactive'}`}>
                {userData?.services?.route_automation ? 'Aktivní' : 'Neaktivní'}
              </span>
            </div>
            <p className="service-description">
              Automatizované taxi lety z bodu A do bodu B s AI navigací
            </p>
            <button
              className={`btn-toggle ${userData?.services?.route_automation ? 'btn-disable' : 'btn-enable'}`}
              onClick={() => handleToggleService('route_automation')}
              disabled={togglingService === 'route_automation'}
            >
              {togglingService === 'route_automation' ? 'Zpracovává se...' : 
               userData?.services?.route_automation ? 'Vypnout službu' : 'Zapnout službu'}
            </button>
          </div>

          <div className="service-card">
            <div className="service-header">
              <h3>✈️ Manual Operation</h3>
              <span className={`status-badge ${userData?.services?.manual_operation ? 'active' : 'inactive'}`}>
                {userData?.services?.manual_operation ? 'Aktivní' : 'Neaktivní'}
              </span>
            </div>
            <p className="service-description">
              Osobní pronájem dronu s vlastním pilotováním (vyžaduje licenci)
            </p>
            <button
              className={`btn-toggle ${userData?.services?.manual_operation ? 'btn-disable' : 'btn-enable'}`}
              onClick={() => handleToggleService('manual_operation')}
              disabled={togglingService === 'manual_operation'}
            >
              {togglingService === 'manual_operation' ? 'Zpracovává se...' : 
               userData?.services?.manual_operation ? 'Vypnout službu' : 'Zapnout službu'}
            </button>
          </div>

          <div className="service-card">
            <div className="service-header">
              <h3>📦 Freight Handling</h3>
              <span className={`status-badge ${userData?.services?.freight_handling ? 'active' : 'inactive'}`}>
                {userData?.services?.freight_handling ? 'Aktivní' : 'Neaktivní'}
              </span>
            </div>
            <p className="service-description">
              Nákladní přeprava balíků a logistika vzduchem
            </p>
            <button
              className={`btn-toggle ${userData?.services?.freight_handling ? 'btn-disable' : 'btn-enable'}`}
              onClick={() => handleToggleService('freight_handling')}
              disabled={togglingService === 'freight_handling'}
            >
              {togglingService === 'freight_handling' ? 'Zpracovává se...' : 
               userData?.services?.freight_handling ? 'Vypnout službu' : 'Zapnout službu'}
            </button>
          </div>
        </div>

        {userData?.enabledServices && userData.enabledServices.length > 0 && (
          <div className="enabled-services-summary">
            <h4>Aktivní služby:</h4>
            <ul>
              {userData.enabledServices.map(service => (
                <li key={service}>
                  {service === 'route_automation' && '🚁 Route Automation'}
                  {service === 'manual_operation' && '✈️ Manual Operation'}
                  {service === 'freight_handling' && '📦 Freight Handling'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderTier2Content = () => (
    <div className="tier-content tier-2">
      <h2>⚙️ Administrátorský Panel</h2>
      <div className="overseer-section">
        <p className="tier-description">
          Vítejte, <strong>System Overseer</strong>! Máte přístup k platformovým nástrojům.
        </p>
        <div className="admin-tools">
          <div className="admin-card">
            <h3>👥 Správa uživatelů</h3>
            <p>Zobrazení a správa uživatelských účtů</p>
            <button className="btn-secondary">Otevřít správu uživatelů</button>
          </div>
          <div className="admin-card">
            <h3>⚙️ Konfigurace systému</h3>
            <p>Nastavení platformy a služeb</p>
            <button className="btn-secondary">Otevřít nastavení</button>
          </div>
          <div className="admin-card">
            <h3>📊 Platformový přehled</h3>
            <p>Analytics a metriky platformy</p>
            <button className="btn-secondary">Zobrazit statistiky</button>
          </div>
        </div>
        <div className="info-note">
          <strong>Poznámka:</strong> Administrátoři nemají přístup ke službám pro předplatitele.
        </div>
      </div>
    </div>
  );

  const renderTier3Content = () => (
    <div className="tier-content tier-3">
      <h2>🔧 Panel Technické Údržby</h2>
      <div className="tech-section">
        <p className="tier-description">
          Vítejte, <strong>Technical Crew</strong>! Spravujte flotilu a diagnostiku.
        </p>
        <div className="tech-tools">
          <div className="tech-card">
            <h3>🛠️ Diagnostické nástroje</h3>
            <p>Kontrola stavu dronů a systémů</p>
            <button className="btn-secondary">Spustit diagnostiku</button>
          </div>
          <div className="tech-card">
            <h3>🔧 Protokoly údržby</h3>
            <p>Plánování a sledování údržby</p>
            <button className="btn-secondary">Otevřít protokoly</button>
          </div>
          <div className="tech-card">
            <h3>📈 Technický management</h3>
            <p>Správa flotily a operací</p>
            <button className="btn-secondary">Otevřít management</button>
          </div>
        </div>
        <div className="info-note">
          <strong>Poznámka:</strong> Technická crew nemá přístup ke službám pro předplatitele.
        </div>
      </div>
    </div>
  );

  if (!authToken) {
    return (
      <div className="flight-access">
        <div className="not-authenticated">
          <h2>🔐 Přihlášení vyžadováno</h2>
          <p>Pro přístup k Flight Tier systému se prosím přihlaste.</p>
          <button className="btn-primary" onClick={() => {
            // In production, this would redirect to login
            const token = prompt('Zadejte autentizační token (pro demo):');
            if (token) {
              localStorage.setItem('authToken', token);
              setAuthToken(token);
            }
          }}>
            Přihlásit se
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flight-access">
        <div className="loading">
          <div className="spinner"></div>
          <p>Načítání dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flight-access">
        <div className="error">
          <h2>❌ Chyba</h2>
          <p>{error}</p>
          <button className="btn-secondary" onClick={loadDashboard}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-access">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>Flight Tier Dashboard</h1>
          {userData && (
            <p className="user-greeting">
              {userData.firstName} {userData.lastName} ({userData.email})
            </p>
          )}
        </div>
        <div className="tier-badge">
          <span className={`badge tier-${userData?.tier}`}>
            Tier {userData?.tier}: {userData?.tierDescription}
          </span>
        </div>
      </div>

      {userData?.tier === 0 && renderTier0Content()}
      {userData?.tier === 1 && renderTier1Content()}
      {userData?.tier === 2 && renderTier2Content()}
      {userData?.tier === 3 && renderTier3Content()}
    </div>
  );
};

export default FlightAccess;
