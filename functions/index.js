/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const { logger } = require("firebase-functions");
// const { onRequest } = require("firebase-functions/v2/https");
// const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
// const { initializeApp } = require("firebase-admin/app");
// const { getFirestore } = require("firebase-admin/firestore");

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";

initializeApp();

const db = getFirestore();


async function logHistoricalChange(action, collectionName, documentId, oldData, newData) {
    try {
        await db.collection("historical_logs").add({
            action,
            collection_name: collectionName,
            document_id: documentId,
            timestamp: new Date(),
            old_data: oldData || null,
            new_data: newData || null,
        });
    } catch (error) {
        console.error("Error logging historical change:", error);
    }
}

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
// exports.addmessage = onRequest(async (req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     const writeResult = await getFirestore()
//         .collection("messages")
//         .add({ original: original });
//     // Send back a message that we've successfully written the message
//     res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

// // Listens for new messages added to /messages/:documentId/original
// // and saves an uppercased version of the message
// // to /messages/:documentId/uppercase
// exports.makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
//     // Grab the current value of what was written to Firestore.
//     const original = event.data.data().original;

//     // Access the parameter `{documentId}` with `event.params`
//     logger.log("Uppercasing", event.params.documentId, original);

//     const uppercase = original.toUpperCase();

//     // You must return a Promise when performing
//     // asynchronous tasks inside a function
//     // such as writing to Firestore.
//     // Setting an 'uppercase' field in Firestore document returns a Promise.
//     return event.data.ref.set({ uppercase }, { merge: true });
// });

// Firestore Trigger for Feedback Collection
export const feedbackTrigger = onDocumentWritten(
    "/feedback/{feedbackId}",
    async (event) => {
        const feedbackId = event.params.feedbackId;
        const oldData = event.data?.before?.exists ? event.data.before.data() : null;
        const newData = event.data?.after?.exists ? event.data.after.data() : null;

        if (!oldData && newData) {
            // Document Created 
            await logHistoricalChange("CREATE", "feedback", feedbackId, null, newData);
        } else if (oldData && newData) {
            // Document Updated
            await logHistoricalChange("UPDATE", "feedback", feedbackId, oldData, newData);
        } else if (oldData && !newData) {
            // Document Deleted
            await logHistoricalChange("DELETE", "feedback", feedbackId, oldData, null);
        }
    }
);

export const employeesTrigger = onDocumentWritten(
    "/employee/{employeeId}",
    async (event) => {
      const employeeId = event.params.employeeId;
      const oldData = event.data?.before?.exists ? event.data.before.data() : null;
      const newData = event.data?.after?.exists ? event.data.after.data() : null;
  
      if (!oldData && newData) {
        // Document Created
        await logHistoricalChange("CREATE", "employees", employeeId, null, newData);
      } else if (oldData && newData) {
        // Document Updated
        await logHistoricalChange("UPDATE", "employees", employeeId, oldData, newData);
      } else if (oldData && !newData) {
        // Document Deleted
        await logHistoricalChange("DELETE", "employees", employeeId, oldData, null);
      }
    }
  );
  
