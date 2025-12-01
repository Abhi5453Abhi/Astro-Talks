
const fetch = require('node-fetch');

async function testGuestUserCreation() {
    console.log('🧪 Testing Guest User Creation...');

    const payload = {
        name: 'Test Guest',
        dateOfBirth: '1990-01-01',
        birthTime: '12:00',
        gender: 'other',
        languages: ['english'],
        zodiacSign: 'Capricorn',
        placeOfBirth: 'Test City'
    };

    try {
        const response = await fetch('http://localhost:3000/api/users/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log(`Response Status: ${response.status}`);

        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Success! Guest user created:', data);
        } else {
            const text = await response.text();
            console.error('❌ Failed:', text);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('Note: Ensure the Next.js server is running on localhost:3000');
    }
}

testGuestUserCreation();
