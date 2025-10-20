# 📱 React Native Integration Guide

Complete API documentation for integrating your Meat Delivery Backend with React Native frontend.

## 🔗 Base Configuration

```javascript
// config/api.js
const API_BASE_URL = 'http://192.168.1.4:5000/api'; // Change for production
// For Android Emulator: http://10.0.2.2:5000/api
// For iOS Simulator: http://192.168.1.4:5000/api
// For Physical Device: http://YOUR_LOCAL_IP:5000/api

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Authentication
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    GET_PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: '/products/:id',
    PRODUCTS_BY_CATEGORY: '/products/category/:category',
    SEARCH_PRODUCTS: '/products/search/:searchTerm',
    
    // Cart
    CART: '/cart',
    CART_SUMMARY: '/cart/summary',
    ADD_TO_CART: '/cart/add',
    UPDATE_CART_ITEM: '/cart/update/:itemId',
    REMOVE_FROM_CART: '/cart/remove/:itemId',
    CLEAR_CART: '/cart/clear',
    
    // Orders
    ORDERS: '/orders',
    ORDER_BY_ID: '/orders/:id',
    ORDER_STATS: '/orders/stats',
    UPDATE_ORDER_STATUS: '/orders/:id/status',
    CANCEL_ORDER: '/orders/:id/cancel',
    
    // Users (Admin)
    USERS: '/users',
    USER_BY_ID: '/users/:id',
    USER_STATS: '/users/stats',
    
    // Health Check
    HEALTH: '/health'
  }
};
```

## 🛠️ API Service Class

```javascript
// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = config.BASE_URL;
  }

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store token
  async setToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Remove token
  async removeToken() {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.makeRequest(endpoint);
  }

  // POST request
  async post(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // PATCH request
  async patch(endpoint, body) {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
```

## 🔐 Authentication API Methods

```javascript
// services/AuthService.js
import ApiService from './ApiService';
import config from '../config/api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await ApiService.post(config.ENDPOINTS.REGISTER, userData);
      
      if (response.success && response.token) {
        await ApiService.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Login with email/password
  async login(email, password) {
    try {
      const response = await ApiService.post(config.ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      if (response.success && response.token) {
        await ApiService.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Request OTP for phone login
  async requestOTP(phone) {
    try {
      return await ApiService.post(config.ENDPOINTS.REQUEST_OTP, { phone });
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP and login
  async verifyOTP(phone, otp) {
    try {
      const response = await ApiService.post(config.ENDPOINTS.VERIFY_OTP, {
        phone,
        otp,
      });
      
      if (response.success && response.token) {
        await ApiService.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      return await ApiService.get(config.ENDPOINTS.GET_PROFILE);
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      return await ApiService.put(config.ENDPOINTS.UPDATE_PROFILE, profileData);
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      return await ApiService.put(config.ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await ApiService.post(config.ENDPOINTS.LOGOUT);
      await ApiService.removeToken();
      return { success: true };
    } catch (error) {
      // Even if API call fails, remove local token
      await ApiService.removeToken();
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    const token = await ApiService.getToken();
    return !!token;
  }
}

export default new AuthService();
```

## 🛍️ Products API Methods

```javascript
// services/ProductService.js
import ApiService from './ApiService';
import config from '../config/api';

class ProductService {
  // Get all products with filters
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const endpoint = `${config.ENDPOINTS.PRODUCTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const endpoint = config.ENDPOINTS.PRODUCT_BY_ID.replace(':id', productId);
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category, page = 1, limit = 10) {
    try {
      const endpoint = `${config.ENDPOINTS.PRODUCTS_BY_CATEGORY.replace(':category', category)}?page=${page}&limit=${limit}`;
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm, page = 1, limit = 10) {
    try {
      const endpoint = `${config.ENDPOINTS.SEARCH_PRODUCTS.replace(':searchTerm', encodeURIComponent(searchTerm))}?page=${page}&limit=${limit}`;
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Create product (Admin only)
  async createProduct(productData) {
    try {
      return await ApiService.post(config.ENDPOINTS.PRODUCTS, productData);
    } catch (error) {
      throw error;
    }
  }

  // Update product (Admin only)
  async updateProduct(productId, productData) {
    try {
      const endpoint = config.ENDPOINTS.PRODUCT_BY_ID.replace(':id', productId);
      return await ApiService.put(endpoint, productData);
    } catch (error) {
      throw error;
    }
  }

  // Delete product (Admin only)
  async deleteProduct(productId) {
    try {
      const endpoint = config.ENDPOINTS.PRODUCT_BY_ID.replace(':id', productId);
      return await ApiService.delete(endpoint);
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();
```

## 🛒 Cart API Methods

```javascript
// services/CartService.js
import ApiService from './ApiService';
import config from '../config/api';

class CartService {
  // Get user's cart
  async getCart() {
    try {
      return await ApiService.get(config.ENDPOINTS.CART);
    } catch (error) {
      throw error;
    }
  }

  // Get cart summary
  async getCartSummary() {
    try {
      return await ApiService.get(config.ENDPOINTS.CART_SUMMARY);
    } catch (error) {
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId, quantity) {
    try {
      return await ApiService.post(config.ENDPOINTS.ADD_TO_CART, {
        productId,
        quantity,
      });
    } catch (error) {
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const endpoint = config.ENDPOINTS.UPDATE_CART_ITEM.replace(':itemId', itemId);
      return await ApiService.put(endpoint, { quantity });
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const endpoint = config.ENDPOINTS.REMOVE_FROM_CART.replace(':itemId', itemId);
      return await ApiService.delete(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      return await ApiService.delete(config.ENDPOINTS.CLEAR_CART);
    } catch (error) {
      throw error;
    }
  }
}

export default new CartService();
```

## 📦 Orders API Methods

```javascript
// services/OrderService.js
import ApiService from './ApiService';
import config from '../config/api';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      return await ApiService.post(config.ENDPOINTS.ORDERS, orderData);
    } catch (error) {
      throw error;
    }
  }

  // Get user's orders
  async getOrders(page = 1, limit = 10, status = null) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) {
        queryParams.append('status', status);
      }
      
      const endpoint = `${config.ENDPOINTS.ORDERS}?${queryParams.toString()}`;
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const endpoint = config.ENDPOINTS.ORDER_BY_ID.replace(':id', orderId);
      return await ApiService.get(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const endpoint = config.ENDPOINTS.CANCEL_ORDER.replace(':id', orderId);
      return await ApiService.patch(endpoint, { reason });
    } catch (error) {
      throw error;
    }
  }

  // Update order status (Admin only)
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const endpoint = config.ENDPOINTS.UPDATE_ORDER_STATUS.replace(':id', orderId);
      return await ApiService.patch(endpoint, { status, notes });
    } catch (error) {
      throw error;
    }
  }

  // Get order statistics (Admin only)
  async getOrderStats() {
    try {
      return await ApiService.get(config.ENDPOINTS.ORDER_STATS);
    } catch (error) {
      throw error;
    }
  }
}

export default new OrderService();
```

## 📱 React Native Component Examples

### Login Screen Example
```javascript
// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import AuthService from '../services/AuthService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        Alert.alert('Success', 'Logged in successfully');
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: '#007bff', padding: 15, borderRadius: 5 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('OTPLogin')}
        style={{ marginTop: 10 }}
      >
        <Text style={{ textAlign: 'center', color: '#007bff' }}>
          Login with OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
```

### OTP Login Screen Example
```javascript
// screens/OTPLoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import AuthService from '../services/AuthService';

const OTPLoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.requestOTP(phone);
      
      if (response.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your phone');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.verifyOTP(phone, otp);
      
      if (response.success) {
        Alert.alert('Success', 'Logged in successfully');
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Phone Number (+1234567890)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!otpSent}
        style={{ 
          borderWidth: 1, 
          padding: 10, 
          marginBottom: 10,
          backgroundColor: otpSent ? '#f0f0f0' : 'white'
        }}
      />
      
      {!otpSent ? (
        <TouchableOpacity
          onPress={handleRequestOTP}
          disabled={loading}
          style={{ backgroundColor: '#007bff', padding: 15, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
          />
          
          <TouchableOpacity
            onPress={handleVerifyOTP}
            disabled={loading}
            style={{ backgroundColor: '#28a745', padding: 15, borderRadius: 5 }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setOtpSent(false)}
            style={{ marginTop: 10 }}
          >
            <Text style={{ textAlign: 'center', color: '#007bff' }}>
              Use different phone number
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default OTPLoginScreen;
```

## 🚀 Getting Started Checklist

### 1. Install Required Dependencies
```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

### 2. Update API Base URL
- For Android Emulator: `http://10.0.2.2:5000/api`
- For iOS Simulator: `http://192.168.1.4:5000/api`
- For Physical Device: `http://YOUR_LOCAL_IP:5000/api`

### 3. File Structure
```
src/
├── config/
│   └── api.js
├── services/
│   ├── ApiService.js
│   ├── AuthService.js
│   ├── ProductService.js
│   ├── CartService.js
│   └── OrderService.js
├── screens/
│   ├── LoginScreen.js
│   ├── OTPLoginScreen.js
│   ├── HomeScreen.js
│   └── ...
└── components/
    └── ...
```

### 4. Error Handling
All services include proper error handling. Make sure to wrap API calls in try-catch blocks and show appropriate user feedback.

### 5. Token Management
The ApiService automatically handles JWT tokens using AsyncStorage. Tokens are automatically attached to authenticated requests.

This structure provides a complete foundation for integrating your React Native app with the backend! 🚀