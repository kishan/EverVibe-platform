#!/usr/bin/env node

/**
 * Simple script to trigger a VAPI AI call
 * This script makes a direct API call to VAPI using the parameters from your curl request
 */

import 'dotenv/config';
import fetch from 'node-fetch';

// Configuration from environment variables
const VAPI_CONFIG = {
  apiKey: process.env.VAPI_API_KEY,
  assistantId: process.env.VAPI_ASSISTANT_ID,
  phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
  customerNumber: process.env.CUSTOMER_NUMBER,
};

function validateEnv() {
  const missing = Object.entries({
    VAPI_API_KEY: VAPI_CONFIG.apiKey,
    VAPI_ASSISTANT_ID: VAPI_CONFIG.assistantId,
    VAPI_PHONE_NUMBER_ID: VAPI_CONFIG.phoneNumberId,
    CUSTOMER_NUMBER: VAPI_CONFIG.customerNumber,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function triggerVapiCall() {
  try {
    validateEnv();
    console.log('🚀 Triggering VAPI AI call...');
    console.log(`📞 Calling: ${VAPI_CONFIG.customerNumber}`);
    
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: VAPI_CONFIG.assistantId,
        phoneNumberId: VAPI_CONFIG.phoneNumberId,
        customer: {
          number: VAPI_CONFIG.customerNumber
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Call initiated successfully!');
    console.log('📋 Call details:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Error triggering call:', error.message);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  triggerVapiCall()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

export { triggerVapiCall };
