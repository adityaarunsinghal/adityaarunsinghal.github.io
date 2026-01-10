// scripts/trmnl-sync.mjs
import admin from 'firebase-admin';

// Initialize Firebase Admin with service account from environment
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
}
if (!process.env.TRMNL_WEBHOOK_URL) {
  throw new Error('TRMNL_WEBHOOK_URL environment variable is required');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const TRMNL_WEBHOOK_URL = process.env.TRMNL_WEBHOOK_URL;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  console.log('🔐 Authenticated with Firebase service account');
  console.log('🔄 Fetching data from Firestore...');
  
  try {
    // 1. Fetch latest love message with >>> prefix (for TRMNL display)
    const messagesSnapshot = await db
      .collection('love-ingy-messages')
      .orderBy('timestamp', 'desc')
      .limit(50)  // Fetch more to find one with >>> prefix
      .get();
    
    let latestMessage = "I love you";
    let messageCount = 0;
    
    if (!messagesSnapshot.empty) {
      // Find the most recent message starting with >>>
      const trmnlDoc = messagesSnapshot.docs.find(doc => 
        doc.data().message?.startsWith('>>>')
      );
      
      if (trmnlDoc) {
        // Strip the >>> prefix and emojis for display
        latestMessage = trmnlDoc.data().message
          .replace(/^>>>\s*/, '')
          .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
          .trim();
      }
      
      // Get total count
      const countSnapshot = await db.collection('love-ingy-messages').count().get();
      messageCount = countSnapshot.data().count;
    }
    
    console.log(`📝 Latest message: [fetched]`);
    console.log(`📊 Total messages: ${messageCount}`);
    
    // 2. Fetch countdown config
    const now = new Date();
    const configDoc = await db.collection('trmnl-config').doc('countdowns').get();
    
    let countdowns = [];
    if (configDoc.exists) {
      const config = configDoc.data();
      const events = config.events || [];
      
      // Calculate days until each event
      const now = new Date();
      countdowns = events
        .map(event => {
          const eventDate = new Date(event.date + 'T00:00:00');
          const diffTime = eventDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            emoji: event.emoji || '📅',
            name: event.name,
            days: diffDays,
            date: event.date
          };
        })
        .filter(e => e.days > 0)  // Only future events
        .sort((a, b) => a.days - b.days)  // Sort by soonest
        .slice(0, 4);  // Max 4 countdowns to fit on screen
    }
    
    console.log(`📅 Countdowns: [${countdowns.length} events]`);
    
    // 3. Build payload for TRMNL (must be under 2KB)
    const payload = {
      merge_variables: {
        love_message: latestMessage.substring(0, 280), // Limit message length
        message_count: messageCount,
        countdowns: countdowns,
        reply_url: "HTTPS://ADITYASINGHAL.COM/LOVESINGY", // Uppercase for smaller QR
        updated_at: now.toISOString()
      }
    };
    
    // Check payload size and truncate if needed
    let payloadSize = JSON.stringify(payload).length;
    console.log(`📦 Payload size: ${payloadSize} bytes (limit: 2048)`);
    
    if (payloadSize > 2048) {
      console.warn('⚠️ Payload exceeds 2KB limit, truncating message...');
      payload.merge_variables.love_message = latestMessage.substring(0, 150) + '...';
      payloadSize = JSON.stringify(payload).length;
      console.log(`📦 New payload size: ${payloadSize} bytes`);
      
      if (payloadSize > 2048) {
        throw new Error(`Payload still too large after truncation: ${payloadSize} bytes`);
      }
    }
    
    // 4. POST to TRMNL webhook
    console.log('📤 Sending to TRMNL webhook...');
    
    const trmnlResponse = await fetch(TRMNL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!trmnlResponse.ok) {
      const errorText = await trmnlResponse.text();
      throw new Error(`TRMNL webhook failed: ${trmnlResponse.status} - ${errorText}`);
    }
    
    const responseData = await trmnlResponse.text();
    console.log('✅ Successfully synced to TRMNL!');
    console.log('📬 Response:', responseData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();