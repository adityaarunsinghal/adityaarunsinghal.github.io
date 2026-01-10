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
      .limit(200)
      .get();
    
    let latestMessage = "I love you. Text me that your TRMNL is on Fallback Mode.";
    let messageCount = 0;
    
    let isThrowback = false;
    let throwbackDate = null;
    
    if (!messagesSnapshot.empty) {
      const now = new Date();
      const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hour = eastern.getHours();
      const isOddHour = hour % 2 === 1;
      
      // Find messages starting with >>>
      const trmnlIntendedMessages = messagesSnapshot.docs.filter(doc => 
        doc.data().message?.startsWith('>>>')
      );
      console.log(`📝 Found ${trmnlIntendedMessages.length} messages with >>> prefix (checked last 200)`);
      console.log(`🕐 Hour ${hour} (${isOddHour ? 'odd - random from all' : 'even - latest >>>'})`);
      
      let selectedDoc;
      if (isOddHour) {
        // Deterministic "random" based on date+hour so same hour = same message
        const seed = eastern.getFullYear() * 1000000 + (eastern.getMonth() + 1) * 10000 + eastern.getDate() * 100 + hour;
        const index = seed % messagesSnapshot.docs.length;
        selectedDoc = messagesSnapshot.docs[index];
        isThrowback = true;
        const timestamp = selectedDoc.data().timestamp?.toDate();
        if (timestamp) {
          throwbackDate = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } else {
        // Latest >>> message
        selectedDoc = trmnlIntendedMessages.length > 0 ? trmnlIntendedMessages[0] : messagesSnapshot.docs[0];
      }
      
      // Strip the >>> prefix and emojis for display
      latestMessage = selectedDoc.data().message
        .replace(/^>>>\s*/, '')
        .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
        .trim();
      console.log(`✂️ Stripped >>> prefix and emojis`);
      
      // Get total count
      const countSnapshot = await db.collection('love-ingy-messages').count().get();
      messageCount = countSnapshot.data().count;
    }
    
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
        is_throwback: isThrowback,
        throwback_date: throwbackDate,
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();