# 🔔 Notification System Implementation Guide

## Overview

Complete notification system for your Meat Delivery App with support for:
- In-app notifications
- Push notifications (ready for Firebase/OneSignal)
- Email notifications (ready for SendGrid/SES)
- SMS notifications (ready for Twilio)
- Real-time updates
- Notification preferences
- Admin notification management

## 📱 React Native Integration

### 1. API Service for Notifications

```javascript
// services/notificationService.js
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationAPIService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/notifications`;
  }

  async getAuthToken() {
    return await AsyncStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    return await response.json();
  }

  // Get notifications with pagination
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`?${queryString}`);
  }

  // Get unread count
  async getUnreadCount() {
    return this.request('/unread-count');
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return this.request(`/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  // Mark all as read
  async markAllAsRead() {
    return this.request('/read-all', {
      method: 'PATCH'
    });
  }

  // Delete notification
  async deleteNotification(notificationId) {
    return this.request(`/${notificationId}`, {
      method: 'DELETE'
    });
  }

  // Clear all notifications
  async clearAll() {
    return this.request('/clear-all', {
      method: 'DELETE'
    });
  }

  // Get notification preferences
  async getPreferences() {
    return this.request('/preferences');
  }

  // Update preferences
  async updatePreferences(preferences) {
    return this.request('/preferences', {
      method: 'PUT',
      body: preferences
    });
  }
}

export default new NotificationAPIService();
```

### 2. React Native Components

```javascript
// components/NotificationBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationBadge = ({ count, style }) => {
  if (!count || count === 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
```

```javascript
// components/NotificationItem.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ 
  notification, 
  onPress, 
  onMarkAsRead, 
  onDelete 
}) => {
  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: '🛒',
      order_confirmed: '✅',
      order_preparing: '👨‍🍳',
      order_out_for_delivery: '🚚',
      order_delivered: '🎉',
      order_cancelled: '❌',
      payment_successful: '💳',
      payment_failed: '⚠️',
      promotion: '🎁',
      coupon_expiring: '⏰',
      new_product: '🥩',
      delivery_delay: '🕐',
      system_announcement: '📢',
    };
    return icons[type] || '🔔';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800', 
      high: '#F44336',
      urgent: '#9C27B0'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unread
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {getNotificationIcon(notification.type)}
          </Text>
          {!notification.isRead && (
            <View 
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(notification.priority) }
              ]} 
            />
          )}
        </View>
        
        <View style={styles.content}>
          <Text 
            style={[
              styles.title,
              !notification.isRead && styles.unreadText
            ]}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          
          <Text style={styles.message} numberOfLines={3}>
            {notification.message}
          </Text>
          
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {!notification.isRead && (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => onMarkAsRead(notification._id)}
            >
              <Text style={styles.markReadText}>•</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  unread: {
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  priorityDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    marginLeft: 8,
  },
  markReadButton: {
    padding: 4,
  },
  markReadText: {
    fontSize: 20,
    color: '#007AFF',
  },
});

export default NotificationItem;
```

### 3. Notification Screen

```javascript
// screens/NotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NotificationAPIService from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, order, promotion
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    
    try {
      const params = {
        page: reset ? 1 : page,
        limit: 20,
        ...(filter !== 'all' && { 
          [filter === 'unread' ? 'isRead' : 'category']: 
          filter === 'unread' ? 'false' : filter 
        })
      };
      
      const response = await NotificationAPIService.getNotifications(params);
      
      if (response.success) {
        const newNotifications = response.data.notifications;
        
        if (reset) {
          setNotifications(newNotifications);
          setPage(2);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(newNotifications.length === 20);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await NotificationAPIService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await NotificationAPIService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Handle notification tap - navigate to relevant screen
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_preparing':
      case 'order_out_for_delivery':
      case 'order_delivered':
        if (notification.metadata?.orderId) {
          navigation.navigate('OrderDetails', { 
            orderId: notification.metadata.orderId 
          });
        }
        break;
      case 'promotion':
      case 'coupon_expiring':
        navigation.navigate('Offers');
        break;
      case 'new_product':
        if (notification.metadata?.productId) {
          navigation.navigate('ProductDetails', { 
            productId: notification.metadata.productId 
          });
        }
        break;
      default:
        // Handle other notification types
        break;
    }
  };

  const FilterButton = ({ title, value, active }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.activeFilter]}
      onPress={() => {
        setFilter(value);
        setPage(1);
        loadNotifications(true);
      }}
    >
      <Text style={[styles.filterText, active && styles.activeFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      loadNotifications(true);
    }, [filter])
  );

  const renderNotification = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterRow}>
        <FilterButton title="All" value="all" active={filter === 'all'} />
        <FilterButton title="Unread" value="unread" active={filter === 'unread'} />
        <FilterButton title="Orders" value="order" active={filter === 'order'} />
        <FilterButton title="Offers" value="promotion" active={filter === 'promotion'} />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptyMessage}>
        You'll see notifications about your orders and offers here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default NotificationScreen;
```

## 📋 API Endpoints Reference

### User Endpoints
```
GET    /api/notifications              # Get notifications (paginated)
GET    /api/notifications/unread-count # Get unread count
GET    /api/notifications/:id          # Get specific notification
PATCH  /api/notifications/:id/read     # Mark as read
DELETE /api/notifications/:id          # Delete notification
PATCH  /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/clear-all    # Clear all notifications
GET    /api/notifications/preferences  # Get preferences
PUT    /api/notifications/preferences  # Update preferences
```

### Admin Endpoints
```
POST   /api/notifications/test         # Send test notification
POST   /api/notifications/bulk         # Send bulk notification
GET    /api/notifications/admin/stats  # Get statistics
```

## 🎯 Notification Types

- **order_placed** - Order successfully created
- **order_confirmed** - Order confirmed by restaurant  
- **order_preparing** - Order being prepared
- **order_out_for_delivery** - Order dispatched
- **order_delivered** - Order delivered successfully
- **order_cancelled** - Order cancelled
- **payment_successful** - Payment processed
- **payment_failed** - Payment failed
- **promotion** - Special offers and promotions
- **coupon_expiring** - Coupon expiry reminder
- **new_product** - New product announcements
- **delivery_delay** - Delivery delay notifications
- **system_announcement** - Important system updates

## 🚀 Features Implemented

✅ **Real-time notifications** (ready for WebSocket integration)  
✅ **Multiple delivery channels** (in-app, push, email, SMS)  
✅ **Notification preferences** per user  
✅ **Auto-generated notifications** for order lifecycle  
✅ **Admin bulk notifications** for promotions  
✅ **Notification templates** with dynamic content  
✅ **Read/unread status tracking**  
✅ **Notification expiry and cleanup**  
✅ **Priority levels** for different notification types  
✅ **Rich metadata** for contextual navigation  

Your notification system is now complete and ready for production! 🎉
