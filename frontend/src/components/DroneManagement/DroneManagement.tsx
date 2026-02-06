import React, { useState } from 'react';
import './DroneManagement.css';

interface Drone {
  id: string;
  name: string;
  battery: number;
  range: number; // in km
  maxPayload: number; // in kg
  status: 'available' | 'in-use' | 'charging' | 'maintenance';
  dockLocation: string;
  lastMaintenance: string;
}

interface Dock {
  id: string;
  name: string;
  location: string;
  availableSlots: number;
  totalSlots: number;
  chargingStations: number;
}

const DroneManagement: React.FC = () => {
  const [drones] = useState<Drone[]>([
    {
      id: 'DR001',
      name: 'Dron Alpha',
      battery: 95,
      range: 25,
      maxPayload: 5,
      status: 'available',
      dockLocation: 'Praha - Centrum',
      lastMaintenance: '2026-01-15'
    },
    {
      id: 'DR002',
      name: 'Dron Beta',
      battery: 45,
      range: 30,
      maxPayload: 7,
      status: 'charging',
      dockLocation: 'Praha - Holešovice',
      lastMaintenance: '2026-01-20'
    },
    {
      id: 'DR003',
      name: 'Dron Gamma',
      battery: 100,
      range: 20,
      maxPayload: 4,
      status: 'in-use',
      dockLocation: 'Praha - Smíchov',
      lastMaintenance: '2026-02-01'
    }
  ]);

  const [docks] = useState<Dock[]>([
    {
      id: 'DOCK001',
      name: 'Praha - Centrum',
      location: 'Václavské náměstí',
      availableSlots: 3,
      totalSlots: 10,
      chargingStations: 5
    },
    {
      id: 'DOCK002',
      name: 'Praha - Holešovice',
      location: 'Výstaviště',
      availableSlots: 7,
      totalSlots: 15,
      chargingStations: 8
    },
    {
      id: 'DOCK003',
      name: 'Praha - Smíchov',
      location: 'Anděl',
      availableSlots: 5,
      totalSlots: 12,
      chargingStations: 6
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'drones' | 'docks'>('drones');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4caf50';
      case 'in-use':
        return '#ff9800';
      case 'charging':
        return '#2196f3';
      case 'maintenance':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Dostupný';
      case 'in-use':
        return 'V provozu';
      case 'charging':
        return 'Nabíjení';
      case 'maintenance':
        return 'Údržba';
      default:
        return status;
    }
  };

  return (
    <div className="drone-management">
      <h2>Správa dronů</h2>

      <div className="tabs">
        <button
          className={selectedTab === 'drones' ? 'active' : ''}
          onClick={() => setSelectedTab('drones')}
        >
          Drony
        </button>
        <button
          className={selectedTab === 'docks' ? 'active' : ''}
          onClick={() => setSelectedTab('docks')}
          >
          Dokovací stanice
        </button>
      </div>

      {selectedTab === 'drones' && (
        <div className="drones-list">
          {drones.map(drone => (
            <div key={drone.id} className="drone-card">
              <div className="drone-header">
                <h3>{drone.name}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(drone.status) }}
                >
                  {getStatusLabel(drone.status)}
                </span>
              </div>
              
              <div className="drone-details">
                <div className="detail-item">
                  <span className="label">ID:</span>
                  <span className="value">{drone.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Baterie:</span>
                  <div className="battery-indicator">
                    <div 
                      className="battery-fill"
                      style={{ 
                        width: `${drone.battery}%`,
                        backgroundColor: drone.battery > 50 ? '#4caf50' : drone.battery > 20 ? '#ff9800' : '#f44336'
                      }}
                    />
                    <span className="battery-text">{drone.battery}%</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="label">Dolet:</span>
                  <span className="value">{drone.range} km</span>
                </div>
                <div className="detail-item">
                  <span className="label">Max. nosnost:</span>
                  <span className="value">{drone.maxPayload} kg</span>
                </div>
                <div className="detail-item">
                  <span className="label">Dok:</span>
                  <span className="value">{drone.dockLocation}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Poslední údržba:</span>
                  <span className="value">{drone.lastMaintenance}</span>
                </div>
              </div>

              {drone.status === 'available' && (
                <button className="reserve-button">Rezervovat dron</button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'docks' && (
        <div className="docks-list">
          {docks.map(dock => (
            <div key={dock.id} className="dock-card">
              <h3>{dock.name}</h3>
              
              <div className="dock-details">
                <div className="detail-item">
                  <span className="label">Lokace:</span>
                  <span className="value">{dock.location}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Dostupná místa:</span>
                  <span className="value">{dock.availableSlots} / {dock.totalSlots}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Nabíjecí stanice:</span>
                  <span className="value">{dock.chargingStations}</span>
                </div>
              </div>

              <div className="slots-visual">
                {Array.from({ length: dock.totalSlots }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`slot ${idx < dock.totalSlots - dock.availableSlots ? 'occupied' : 'free'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DroneManagement;
