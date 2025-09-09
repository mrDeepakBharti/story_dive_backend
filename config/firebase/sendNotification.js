import admin from "firebase-admin";

import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const sendNotificationToUser = async (
  deviceToken,
  title,
  body,
  imageUrl,
  data,
  actionPage
) => {
  const message = {
    token: deviceToken,
    notification: { title, body, image: imageUrl },
    android: { notification: { channel_id: "StoryDive" } },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: "default",
          badge: 1,
          "mutable-content": 1,
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
    console.log("✅ Successfully sent message:", response);
    return { success: 1, result: response, payload: message };
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return { success: 0, result: error, payload: message };
  }
};

export default sendNotificationToUser;
