import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testNewModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Test with the new model name
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "Hello! This is a test. Please respond with a brief greeting."
            }]
        }]
    };
    
    try {
        console.log('Testing gemini-2.5-flash model...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        console.log('Response status:', response.status);
        
        if (response.ok) {
            console.log('✅ gemini-2.5-flash works!');
            console.log('Response:', result.candidates[0].content.parts[0].text);
        } else {
            console.log('❌ gemini-2.5-flash failed');
            console.log('Error:', result);
        }
        
    } catch (error) {
        console.error('Error testing model:', error.message);
    }
}

testNewModel();