const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

admin.initializeApp();

// Create a new Expo SDK client
let expo = new Expo();

exports.sendJobNotification = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const jobData = snap.data();
    const jobId = context.params.jobId;

    // Get all user tokens from your users collection
    // You'll need to store Expo push tokens in your user documents
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    let messages = [];
    
    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      if (userData.expoPushToken && Expo.isExpoPushToken(userData.expoPushToken)) {
        messages.push({
          to: userData.expoPushToken,
          sound: 'default',
          title: 'New Job Available!',
          body: `${jobData.title} at ${jobData.company}`,
          data: { 
            jobId: jobId,
            type: 'new_job',
            jobData: jobData 
          },
        });
      }
    });

    // Send notifications
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }

    return { success: true, ticketCount: tickets.length };
  }); 