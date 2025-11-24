
const fetch = require('node-fetch');

async function testAstrologersList() {
    console.log('🧪 Testing Astrologers List API...');

    try {
        const response = await fetch('http://localhost:3000/api/astrologers/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response Status: ${response.status}`);

        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Success! Found', data.astrologers.length, 'astrologers.');
            data.astrologers.forEach(a => {
                console.log(`   - ${a.name} (₹${a.price}/min) [${a.is_online ? 'Online' : 'Offline'}]`);
            });
        } else {
            const text = await response.text();
            console.error('❌ Failed:', text);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('Note: Ensure the Next.js server is running on localhost:3000');
    }
}

testAstrologersList();
