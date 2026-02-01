import { Server } from 'socket.io';
import { logger } from '@/utils/logger';
import { cacheSet, cacheGet } from '@/config/redis';

interface ClientInfo {
  id: string;
  userId?: number;
  userRole?: string;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: string[];
}

interface RoomInfo {
  name: string;
  clients: Set<string>;
  createdAt: Date;
  lastActivity: Date;
  data: any;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  roomId?: string;
  userId?: number;
}

export class WebSocketService {
  private io: Server;
  private clients: Map<string, ClientInfo> = new Map();
  private rooms: Map<string, RoomInfo> = new Map();
  private dataUpdateInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
    this.startDataBroadcast();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    this.io.on('disconnect', (socket) => {
      this.handleDisconnection(socket);
    });
  }

  private handleConnection(socket: any): void {
    const clientInfo: ClientInfo = {
      id: socket.id,
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: []
    };

    this.clients.set(socket.id, clientInfo);
    
    logger.info(`WebSocket client connected: ${socket.id}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to MineralInsight WebSocket',
      clientId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Set up client event handlers
    socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
    socket.on('leave-room', (data) => this.handleLeaveRoom(socket, data));
    socket.on('subscribe', (data) => this.handleSubscribe(socket, data));
    socket.on('unsubscribe', (data) => this.handleUnsubscribe(socket, data));
    socket.on('ping', () => this.handlePing(socket));
  }

  private handleDisconnection(socket: any): void {
    const clientInfo = this.clients.get(socket.id);
    if (clientInfo) {
      // Remove client from all rooms
      clientInfo.subscriptions.forEach(roomName => {
        const room = this.rooms.get(roomName);
        if (room) {
          room.clients.delete(socket.id);
          this.io.to(roomName).emit('client-left', {
            clientId: socket.id,
            timestamp: new Date().toISOString()
          });
        }
      });

      this.clients.delete(socket.id);
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    }
  }

  private handleJoinRoom(socket: any, data: { roomId: string; userId?: number; userRole?: string }): void {
    const { roomId, userId, userRole } = data;
    
    // Update client info
    const clientInfo = this.clients.get(socket.id);
    if (clientInfo) {
      clientInfo.userId = userId;
      clientInfo.userRole = userRole;
      clientInfo.lastActivity = new Date();
    }

    // Join room
    socket.join(roomId);
    
    // Update room info
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        name: roomId,
        clients: new Set(),
        createdAt: new Date(),
        lastActivity: new Date(),
        data: {}
      };
      this.rooms.set(roomId, room);
    }
    
    room.clients.add(socket.id);
    room.lastActivity = new Date();

    // Notify room members
    this.io.to(roomId).emit('user-joined', {
      clientId: socket.id,
      userId,
      userRole,
      timestamp: new Date(),
      memberCount: room.clients.size
    });

    // Send current room data to new member
    socket.emit('room-data', {
      roomId,
      data: room.data,
      memberCount: room.clients.size
    });

    logger.info(`Client ${socket.id} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: any, data: { roomId: string }): void {
    const clientInfo = this.clients.get(socket.id);
    const room = this.rooms.get(data.roomId);
    
    if (room && room.clients.has(socket.id)) {
      room.clients.delete(socket.id);
      room.lastActivity = new Date();
      
      socket.leave(data.roomId);
      
      // Notify remaining room members
      this.io.to(data.roomId).emit('user-left', {
        clientId: socket.id,
        timestamp: new Date(),
        memberCount: room.clients.size
      });

      // Clean up empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(data.roomId);
      }

      // Update client subscriptions
      if (clientInfo) {
        clientInfo.subscriptions = clientInfo.subscriptions.filter(r => r !== data.roomId);
      }

      logger.info(`Client ${socket.id} left room ${data.roomId}`);
    }
  }

  private handleSubscribe(socket: any, data: { channel: string; filters?: any }): void {
    const clientInfo = this this.clients.get(socket.id);
    if (!clientInfo) return;

    const channel = data.channel;
    
    // Add to subscriptions
    if (!clientInfo.subscriptions.includes(channel)) {
      clientInfo.subscriptions.push(channel);
      clientInfo.lastActivity = new Date();
    }

    // Join channel room
    socket.join(`channel:${channel}`);

    // Send confirmation
    socket.emit('subscribed', { channel, filters });
    
    logger.info(`Client ${socket.id} subscribed to ${channel}`);
  }

  private handleUnsubscribe(socket: any, data: { channel: string }): void {
    const clientInfo = this.clients.get(socket.id);
    if (!clientInfo) return;

    const channel = data.channel;
    
    // Remove from subscriptions
    clientInfo.subscriptions = clientInfo.subscriptions.filter(r => r !== channel);
    clientInfo.lastActivity = new Date();

    // Leave channel room
    socket.leave(`channel:${channel}`);

    // Send confirmation
    socket.emit('unsubscribed', { channel });
    
    logger.info(`Client ${socket.id} unsubscribed from ${channel}`);
  }

  private handlePing(socket: any): void {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Broadcasting methods
  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  broadcastToRoom(roomId: string, event: string, data: any): void {
    this.io.to(roomId).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  broadcastToChannel(channel: string, event: string, data: any): void {
    this.io.to(`channel:${channel}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  broadcastToUser(userId: number, event: string, data: any): void {
    // Find all client connections for this user
    const userClients = Array.from(this.clients.values())
      .filter(client => client.userId === userId);

    userClients.forEach(client => {
      this.io.to(client.id).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Data broadcasting
  private startDataBroadcast(): void {
    // Broadcast market data updates every 30 seconds
    this.dataUpdateInterval = setInterval(() => {
      this.broadcastMarketUpdates();
    }, 30000);
  }

  async broadcastMarketUpdates(): Promise<void> {
    try {
      // Get latest market data
      const marketData = await this.getLatestMarketData();
      
      // Broadcast to all subscribed clients
      this.broadcastToChannel('market-updates', 'market-data', marketData);
      
      // Cache the data
      await cacheSet('websocket:latest-market-data', marketData, 60);
    } catch (error) {
      logger.error('Error broadcasting market updates:', error);
    }
  }

  async broadcastPriceAlert(alert: any): Promise<void> {
    try {
      this.broadcastToChannel('price-alerts', 'price-alert', alert);
      
      // Cache important alerts
      await cacheSet(`websocket:price-alert:${alert.id}`, alert, 300);
    } catch (error) {
      logger.error('Error broadcasting price alert:', error);
    }
  }

  async broadcastRiskUpdate(update: any): Promise<void> {
    try {
      this.broadcastToChannel('risk-updates', 'risk-update', update);
      
      // Cache risk updates
      await cacheSet(`websocket:risk-update:${update.id}`, update, 300);
    } (error) {
      logger.error('Error broadcasting risk update:', error);
    }
  }

  async broadcastTradeNotification(notification: any): Promise<void> {
    try {
      this.broadcastToChannel('trade-notifications', 'trade-notification', notification);
      
      // Cache trade notifications
      await cacheSet(`websocket:trade-notification:${notification.id}`, notification, 300);
    } (error) {
      logger.error('Error broadcasting trade notification:', error);
    }
  }

  // Data retrieval helpers
  private async getLatestMarketData(): Promise<any> {
    // In production, this would fetch actual market data
    // For now, return mock data
    return {
      timestamp: new Date().toISOString(),
      lithium: {
        price: 15000,
        change: '+2.5%',
        volume: 1000,
        trend: 'up'
      },
      cobalt: {
        price: 75000,
        change: '-1.2%',
        volume: 500,
        trend: 'down'
      },
      copper: {
        price: 8500,
        change: '+0.8%',
        volume: 5000,
        trend: 'up'
      }
    };
  }

  // Statistics and monitoring
  getStats(): any {
    return {
      connectedClients: this.clients.size,
      activeRooms: this.rooms.size,
      totalSubscriptions: Array.from(this.clients.values())
        .reduce((total, client) => total + client.subscriptions.length, 0),
      uptime: process.uptime()
    };
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  // Cleanup
  destroy(): void {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
    
    this.io.close();
    logger.info('WebSocket service destroyed');
  }
}
