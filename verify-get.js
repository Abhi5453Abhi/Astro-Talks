
const fetch = require('node-fetch');

async function testGetUser() {
    console.log('🧪 Testing Get User (Unauthenticated)...');

    try {
        const response = await fetch('http://localhost:3000/api/users/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response Status: ${response.status}`);

        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Success! Response:', data);
            if (data.user === null) {
                console.log('   (Correctly returned null user)');
            } else {
                console.log('   (Returned a user object)');
            }
        } else {
            const text = await response.text();
            console.error('❌ Failed:', text);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('Note: Ensure the Next.js server is running on localhost:3000');
    }
}

testGetUser();
