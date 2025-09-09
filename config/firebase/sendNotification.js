// sendNotification.js
import admin from 'firebase-admin';
import serviceAccount from "../firebase/storydive-cda1a-firebase-adminsdk-fbsvc-c9ed575742.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotificationToUser = async (deviceToken, title, body, imageUrl, data, actionPage) => {
  const message = {
    token: deviceToken,
    notification: { title, body, image: imageUrl },
    android: { notification: { channel_id: 'StoryDive' } },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: 'default',
          badge: 1,
          'mutable-content': 1,
        },
      },
      fcm_options: { image: imageUrl },
    },
    data: {
      ...data,
      click_action: actionPage,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Successfully sent message:', response);
    return { success: 1, result: response, payload: message };
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return { success: 0, result: error, payload: message };
  }
};

export default sendNotificationToUser;
