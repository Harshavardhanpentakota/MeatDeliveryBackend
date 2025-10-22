# 📍 "Make This Default" Address Feature Implementation Guide

## 🎯 **Feature Overview**

Your Meat Delivery Backend already has the **"Make This Default"** functionality implemented! Here's how to integrate it into your React Native app.

## 🔗 **API Endpoint**

**PATCH** `/api/addresses/:addressId/default`

- **Purpose**: Set any saved address as the new default address
- **Authentication**: Required (Bearer token)
- **Response**: Returns updated list of all addresses with new default status

## 📱 **React Native Implementation**

### **1. Address Service Function**

Add this to your address service:

```typescript
// services/addressService.ts
class AddressService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Set an address as the new default
   * @param addressId - ID of the address to make default
   */
  async setDefaultAddress(addressId: string): Promise<{
    success: boolean;
    message: string;
    addresses: Address[];
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/addresses/${addressId}/default`,
        {
          method: 'PATCH',
          headers: await this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to set default address');
      }
      
      return data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }

  /**
   * Get all saved addresses
   */
  async getSavedAddresses(): Promise<{
    success: boolean;
    addresses: Address[];
    count: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
```

### **2. Address Interface**

```typescript
// types/address.ts
export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  landmark?: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### **3. Address Selection Screen Component**

```tsx
// screens/AddressSelectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  StyleSheet 
} from 'react-native';
import { addressService } from '../services/addressService';
import { Address } from '../types/address';

const AddressSelectionScreen = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [makingDefault, setMakingDefault] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getSavedAddresses();
      setAddresses(response.addresses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDefault = async (addressId: string, addressLabel: string) => {
    try {
      setMakingDefault(addressId);
      
      const response = await addressService.setDefaultAddress(addressId);
      
      // Update local state with the returned addresses
      setAddresses(response.addresses);
      
      Alert.alert(
        'Success', 
        `"${addressLabel}" is now your default address`
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        error.message || 'Failed to set default address'
      );
    } finally {
      setMakingDefault(null);
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressLabel}>{item.label}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.addressDetails}>
        {item.street}, {item.city}, {item.state} {item.zipCode}
      </Text>
      
      {item.landmark && (
        <Text style={styles.landmark}>📍 {item.landmark}</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => {
            // Handle address selection for order
            console.log('Selected address:', item);
          }}
        >
          <Text style={styles.selectButtonText}>
            {item.isDefault ? 'Continue with Default' : 'Select This Address'}
          </Text>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={[
              styles.makeDefaultButton,
              makingDefault === item._id && styles.makingDefaultButton
            ]}
            onPress={() => handleMakeDefault(item._id, item.label)}
            disabled={makingDefault === item._id}
          >
            <Text style={styles.makeDefaultText}>
              {makingDefault === item._id 
                ? 'Setting Default...' 
                : 'Make This Default'
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Delivery Address</Text>
      
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        renderItem={renderAddressItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  landmark: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  makeDefaultButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  makingDefaultButton: {
    backgroundColor: '#BDBDBD',
  },
  makeDefaultText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 12,
  },
});

export default AddressSelectionScreen;
```

## 🎨 **UI/UX Recommendations**

### **Button States:**
1. **Default Address**: Show "DEFAULT" badge, no "Make Default" button
2. **Non-Default**: Show "Make This Default" button
3. **Loading State**: Show "Setting Default..." with disabled styling

### **Visual Feedback:**
- ✅ **Success Toast**: "Office is now your default address"
- 🔄 **Loading Animation**: During API call
- ⚠️ **Error Handling**: Show meaningful error messages

### **Button Styling:**
```tsx
// Suggested colors for the "Make This Default" button
const buttonStyles = {
  normal: {
    backgroundColor: '#E3F2FD',   // Light blue
    borderColor: '#2196F3',       // Blue border
    borderWidth: 1,
  },
  text: {
    color: '#1976D2',             // Dark blue text
    fontWeight: '500',
  }
};
```

## 🔄 **State Management Integration**

If using Redux/Context:

```typescript
// Redux action
export const setDefaultAddress = (addressId: string) => async (dispatch) => {
  try {
    dispatch({ type: 'SET_DEFAULT_ADDRESS_START' });
    
    const response = await addressService.setDefaultAddress(addressId);
    
    dispatch({ 
      type: 'SET_DEFAULT_ADDRESS_SUCCESS', 
      payload: response.addresses 
    });
    
    return response;
  } catch (error) {
    dispatch({ 
      type: 'SET_DEFAULT_ADDRESS_ERROR', 
      payload: error.message 
    });
    throw error;
  }
};
```

## 🧪 **Testing the API**

You can test the functionality using these curl commands:

```bash
# 1. Login to get token
curl -X POST http://192.168.1.9:5000/api/auth/login-pin \
  -H "Content-Type: application/json" \
  -d '{"identifier":"your-email@example.com","pin":"123456"}'

# 2. Get addresses
curl -X GET http://192.168.1.9:5000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Set address as default
curl -X PATCH http://192.168.1.9:5000/api/addresses/ADDRESS_ID/default \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ **Implementation Checklist**

- [ ] Add `setDefaultAddress` function to address service
- [ ] Create address selection screen with "Make Default" buttons
- [ ] Implement loading states and error handling
- [ ] Add success feedback (toast/alert)
- [ ] Test with multiple addresses
- [ ] Handle edge cases (network errors, invalid address IDs)
- [ ] Add analytics tracking for default address changes

## 🎯 **Key Benefits**

1. **Seamless UX**: Users can quickly switch default addresses
2. **Real-time Updates**: Interface updates immediately after API call
3. **Error Handling**: Graceful fallback for network issues
4. **Visual Feedback**: Clear indication of current default address

Your backend is **100% ready** for this feature! The API endpoint is working perfectly and returns the updated address list with the new default status. 🚀📱