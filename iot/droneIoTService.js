/**
 * IoT Drone Communication Protocol
 * Handles real-time communication with physical drones using AWS IoT or Azure IoT
 */

const EventEmitter = require('events');

class DroneIoTService extends EventEmitter {
  constructor() {
    super();
    this.connectedDrones = new Map();
    this.telemetryBuffer = new Map();
  }

  /**
   * Initialize IoT connection for a drone
   * @param {String} droneId - Unique drone identifier
   * @param {Object} config - IoT configuration
   */
  async connectDrone(droneId, config = {}) {
    try {
      console.log(`Connecting drone ${droneId} to IoT platform...`);
      
      // In production, this would establish actual IoT connection
      // using AWS IoT SDK or Azure IoT SDK
      
      const connection = {
        droneId,
        connected: true,
        lastHeartbeat: new Date(),
        protocol: config.protocol || 'MQTT',
        endpoint: config.endpoint || process.env.AWS_IOT_ENDPOINT
      };

      this.connectedDrones.set(droneId, connection);
      this.emit('drone-connected', droneId);

      return connection;
    } catch (error) {
      console.error(`Error connecting drone ${droneId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect drone from IoT platform
   * @param {String} droneId - Unique drone identifier
   */
  async disconnectDrone(droneId) {
    const connection = this.connectedDrones.get(droneId);
    
    if (connection) {
      this.connectedDrones.delete(droneId);
      this.emit('drone-disconnected', droneId);
      console.log(`Drone ${droneId} disconnected`);
    }
  }

  /**
   * Send command to drone
   * @param {String} droneId - Target drone ID
   * @param {String} command - Command type
   * @param {Object} params - Command parameters
   */
  async sendCommand(droneId, command, params = {}) {
    const connection = this.connectedDrones.get(droneId);
    
    if (!connection) {
      throw new Error(`Drone ${droneId} not connected`);
    }

    const commandPayload = {
      droneId,
      command,
      params,
      timestamp: new Date(),
      messageId: this.generateMessageId()
    };

    console.log(`Sending command to drone ${droneId}:`, command);
    
    // In production, publish to IoT topic
    // await iotClient.publish(`drones/${droneId}/commands`, commandPayload);

    this.emit('command-sent', commandPayload);
    
    return commandPayload;
  }

  /**
   * Receive telemetry data from drone
   * @param {String} droneId - Source drone ID
   * @param {Object} telemetry - Telemetry data
   */
  async receiveTelemetry(droneId, telemetry) {
    const data = {
      droneId,
      ...telemetry,
      receivedAt: new Date()
    };

    // Store in buffer
    if (!this.telemetryBuffer.has(droneId)) {
      this.telemetryBuffer.set(droneId, []);
    }
    
    const buffer = this.telemetryBuffer.get(droneId);
    buffer.push(data);
    
    // Keep only last 100 telemetry records per drone
    if (buffer.length > 100) {
      buffer.shift();
    }

    this.emit('telemetry-received', data);
    
    return data;
  }

  /**
   * Get latest telemetry for drone
   * @param {String} droneId - Drone ID
   */
  getLatestTelemetry(droneId) {
    const buffer = this.telemetryBuffer.get(droneId);
    return buffer ? buffer[buffer.length - 1] : null;
  }

  /**
   * Monitor drone health
   * @param {String} droneId - Drone ID
   */
  async monitorHealth(droneId) {
    const telemetry = this.getLatestTelemetry(droneId);
    
    if (!telemetry) {
      return { status: 'unknown', message: 'No telemetry data available' };
    }

    const health = {
      status: 'healthy',
      warnings: [],
      errors: []
    };

    // Check battery level
    if (telemetry.batteryLevel < 20) {
      health.warnings.push('Low battery');
      health.status = 'warning';
    }

    // Check sensor status
    if (!telemetry.sensors?.gps) {
      health.errors.push('GPS sensor offline');
      health.status = 'error';
    }

    // Check communication lag
    const lagSeconds = (new Date() - new Date(telemetry.receivedAt)) / 1000;
    if (lagSeconds > 30) {
      health.warnings.push('Communication lag detected');
      health.status = 'warning';
    }

    return health;
  }

  /**
   * Request autonomous flight to destination
   * @param {String} droneId - Drone ID
   * @param {Object} destination - Destination coordinates
   * @param {Array} waypoints - Intermediate waypoints
   */
  async requestAutonomousFlight(droneId, destination, waypoints = []) {
    return await this.sendCommand(droneId, 'START_AUTONOMOUS_FLIGHT', {
      destination,
      waypoints,
      flightMode: 'autonomous',
      collisionAvoidance: true
    });
  }

  /**
   * Enable collision avoidance system
   * @param {String} droneId - Drone ID
   * @param {Boolean} enabled - Enable/disable
   */
  async setCollisionAvoidance(droneId, enabled = true) {
    return await this.sendCommand(droneId, 'SET_COLLISION_AVOIDANCE', {
      enabled
    });
  }

  /**
   * Update drone sensors configuration
   * @param {String} droneId - Drone ID
   * @param {Object} sensorConfig - Sensor configuration
   */
  async updateSensorConfig(droneId, sensorConfig) {
    return await this.sendCommand(droneId, 'UPDATE_SENSORS', sensorConfig);
  }

  /**
   * Emergency stop/land
   * @param {String} droneId - Drone ID
   */
  async emergencyStop(droneId) {
    return await this.sendCommand(droneId, 'EMERGENCY_STOP', {
      action: 'land',
      priority: 'critical'
    });
  }

  /**
   * Generate unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status for all drones
   */
  getConnectionStatus() {
    const status = [];
    
    this.connectedDrones.forEach((connection, droneId) => {
      status.push({
        droneId,
        connected: connection.connected,
        lastHeartbeat: connection.lastHeartbeat,
        protocol: connection.protocol
      });
    });

    return status;
  }
}

module.exports = new DroneIoTService();
