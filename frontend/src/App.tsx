import React, { useState } from 'react';
import './App.css';
import RouteSelection from './components/RouteSelection/RouteSelection';
import DroneTracking from './components/DroneTracking/DroneTracking';
import Payment from './components/Payment/Payment';
import DroneManagement from './components/DroneManagement/DroneManagement';
import Authorization from './components/Authorization/Authorization';
import PhotoControl from './components/PhotoControl/PhotoControl';
import Legislative from './components/Legislative/Legislative';

type Tab = 'route' | 'tracking' | 'payment' | 'management' | 'authorization' | 'photo' | 'legislative';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('route');

  const renderContent = () => {
    switch (activeTab) {
      case 'route':
        return <RouteSelection />;
      case 'tracking':
        return <DroneTracking />;
      case 'payment':
        return <Payment />;
      case 'management':
        return <DroneManagement />;
      case 'authorization':
        return <Authorization />;
      case 'photo':
        return <PhotoControl />;
      case 'legislative':
        return <Legislative />;
      default:
        return <RouteSelection />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🚁 DroneShare Mobility</h1>
          <p className="tagline">Ekologická dopravní síť nové generace</p>
        </div>
      </header>

      <nav className="navigation">
        <button
          className={activeTab === 'route' ? 'active' : ''}
          onClick={() => setActiveTab('route')}
        >
          📍 Výběr trasy
        </button>
        <button
          className={activeTab === 'tracking' ? 'active' : ''}
          onClick={() => setActiveTab('tracking')}
        >
          📡 Sledování dronu
        </button>
        <button
          className={activeTab === 'payment' ? 'active' : ''}
          onClick={() => setActiveTab('payment')}
        >
          💳 Platby
        </button>
        <button
          className={activeTab === 'management' ? 'active' : ''}
          onClick={() => setActiveTab('management')}
        >
          🔧 Správa dronů
        </button>
        <button
          className={activeTab === 'authorization' ? 'active' : ''}
          onClick={() => setActiveTab('authorization')}
        >
          ✓ Oprávnění
        </button>
        <button
          className={activeTab === 'photo' ? 'active' : ''}
          onClick={() => setActiveTab('photo')}
        >
          📸 Fotokontrola
        </button>
        <button
          className={activeTab === 'legislative' ? 'active' : ''}
          onClick={() => setActiveTab('legislative')}
        >
          📋 Legislativa
        </button>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>

      <footer className="App-footer">
        <p>&copy; 2026 DroneShare Mobility - Spojujeme pokročilé drony s umělou inteligencí</p>
      </footer>
    </div>
  );
}

export default App;
