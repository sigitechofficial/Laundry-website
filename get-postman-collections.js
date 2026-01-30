/**
 * Script to fetch all Postman collections
 * 
 * Usage:
 * 1. Get your Postman API key from: https://web.postman.co/settings/me/api-keys
 * 2. Set it as an environment variable: export POSTMAN_API_KEY="your-api-key"
 *    Or replace POSTMAN_API_KEY in the script below
 * 3. Run: node get-postman-collections.js
 */

const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY || 'YOUR_POSTMAN_API_KEY_HERE';
const POSTMAN_API_BASE_URL = 'https://api.getpostman.com';

async function getAllCollections() {
  try {
    const response = await fetch(`${POSTMAN_API_BASE_URL}/collections`, {
      method: 'GET',
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.collections && data.collections.length > 0) {
      console.log('\n=== All Postman Collections ===\n');
      console.log(`Total Collections: ${data.collections.length}\n`);

      data.collections.forEach((collection, index) => {
        console.log(`${index + 1}. Collection Name: ${collection.name}`);
        console.log(`   Collection ID: ${collection.uid || collection.id || 'N/A'}`);
        console.log(`   Updated At: ${collection.updatedAt || 'N/A'}`);
        console.log('');
      });

      // Also return as JSON for programmatic use
      return data.collections.map(col => ({
        name: col.name,
        id: col.uid || col.id,
        updatedAt: col.updatedAt
      }));
    } else {
      console.log('No collections found in your Postman account.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    if (error.message.includes('401')) {
      console.error('\n⚠️  Authentication failed. Please check your Postman API key.');
      console.error('Get your API key from: https://web.postman.co/settings/me/api-keys');
    }
    throw error;
  }
}

// Run the script
if (require.main === module) {
  getAllCollections()
    .then(collections => {
      console.log('\n✅ Successfully fetched collections!');
    })
    .catch(error => {
      console.error('\n❌ Failed to fetch collections:', error);
      process.exit(1);
    });
}

module.exports = { getAllCollections };
