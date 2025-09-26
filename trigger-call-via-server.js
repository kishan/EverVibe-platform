#!/usr/bin/env node

/**
 * Simple script to trigger a VAPI AI call via your existing server
 * This script makes a POST request to your local server's /call endpoint
 */

import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration
const SERVER_CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  customerNumber: process.env.CUSTOMER_NUMBER,
};

function validateEnv() {
  const missing = Object.entries({
    CUSTOMER_NUMBER: SERVER_CONFIG.customerNumber,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function triggerCallViaServer() {
  try {
    validateEnv();
    console.log('🚀 Triggering VAPI AI call via local server...');
    console.log(`📞 Calling: ${SERVER_CONFIG.customerNumber}`);
    console.log(`🌐 Server: ${SERVER_CONFIG.baseUrl}`);
    
    const response = await fetch(`${SERVER_CONFIG.baseUrl}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerNumber: SERVER_CONFIG.customerNumber,
        metadata: {
          triggeredBy: 'script',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Call initiated successfully via server!');
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Error triggering call:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your server is running with: npm start or node index.js');
    }
    
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  triggerCallViaServer()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

export { triggerCallViaServer };
