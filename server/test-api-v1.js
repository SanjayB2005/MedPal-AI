import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Try v1 API instead of v1beta
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "Hello, world!"
            }]
        }]
    };
    
    try {
        console.log('Testing v1 API with gemini-pro...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.text();
        console.log('Response status:', response.status);
        console.log('Response:', result);
        
        if (response.ok) {
            console.log('✅ v1 API works!');
        } else {
            console.log('❌ v1 API failed');
            
            // Try listing models with v1 API
            console.log('\nTrying to list models with v1 API...');
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
            const listResponse = await fetch(listUrl);
            const listResult = await listResponse.text();
            console.log('List models response:', listResult);
        }
        
    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

testGeminiAPI();