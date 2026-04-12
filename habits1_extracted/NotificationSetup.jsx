import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertCircle } from 'lucide-react';

/**
 * PUSH NOTIFICATIONS INTEGRATION
 * 
 * This module handles daily reminders for Habits Class students.
 * Sends: "Time for today's devotional!" at 7:00 AM
 * 
 * Setup required:
 * 1. Firebase Cloud Messaging (FCM) - OR -
 * 2. Custom backend with Web Push API
 * 
 * This is LOW PRIORITY - implement after Week 1 feedback.
 */

export function NotificationSetup() {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [subscriptionData, setSubscriptionData] = useState(null);

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Check if already subscribed to push
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.pushManager.getSubscription().then(subscription => {
            setIsSubscribed(!!subscription);
            setSubscriptionData(subscription);
          });
        });
      }

      // Load saved reminder time
      const saved = localStorage.getItem('habitsReminderTime');
      if (saved) setReminderTime(saved);
    }
  }, []);

  // ==================== REQUEST PERMISSION ====================
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Subscribe to push notifications
        subscribeToPushNotifications();
        showTestNotification();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // ==================== SUBSCRIBE TO PUSH ====================
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // This requires a VAPID key from your backend
      // For production, replace with your actual public VAPID key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Replace with your public VAPID key
          'YOUR_PUBLIC_VAPID_KEY_HERE'
        )
      });

      // Send subscription to backend (not implemented - requires backend)
      // await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     subscription: subscription,
      //     reminderTime: reminderTime
      //   })
      // });

      setIsSubscribed(true);
      setSubscriptionData(subscription);
      localStorage.setItem('habitsReminderTime', reminderTime);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  // ==================== TEST NOTIFICATION ====================
  const showTestNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Habits Class Reminder', {
          badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23FFEA00" width="96" height="96"/><text x="50%" y="50%" font-size="60" font-weight="bold" fill="%23000000" text-anchor="middle" dominant-baseline="middle">HC</text></svg>',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23000000" width="96" height="96"/><text x="50%" y="50%" font-size="60" font-weight="bold" fill="%23FFEA00" text-anchor="middle" dominant-baseline="middle">HC</text></svg>',
          title: '📖 Time for Today\'s Devotional',
          body: 'Your daily reading, S.O.A.P., and prayers are waiting. Let\'s start your day with Scripture!',
          tag: 'habits-reminder',
          requireInteraction: false,
          actions: [
            { action: 'open', title: 'Open App', icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">→</text></svg>' },
            { action: 'dismiss', title: 'Later', icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text x="50%" y="50%" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">✕</text></svg>' }
          ]
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6" style={{ fontFamily: "'Syne', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black flex items-center gap-3 mb-2" style={{ color: '#FFEA00' }}>
            <Bell className="h-10 w-10" />
            Daily Reminders
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Push Notifications Setup · Low Priority (Post-Week 1)</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Notification Permission */}
          <div className="bg-gray-900 border-4 border-gray-800 p-6">
            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Permission
            </h3>
            <p className={`text-2xl font-black mb-2 ${
              notificationPermission === 'granted' ? 'text-green-400' : 
              notificationPermission === 'denied' ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {notificationPermission === 'granted' && '✓ Enabled'}
              {notificationPermission === 'denied' && '✗ Blocked'}
              {notificationPermission === 'default' && '? Not Asked'}
            </p>
            <p className="text-xs text-gray-500">
              {notificationPermission === 'granted' && 'You\'ll receive reminders at your selected time'}
              {notificationPermission === 'denied' && 'Enable in browser settings to use notifications'}
              {notificationPermission === 'default' && 'Click button below to enable notifications'}
            </p>
          </div>

          {/* Subscription Status */}
          <div className="bg-gray-900 border-4 border-gray-800 p-6">
            <h3 className="text-sm font-bold uppercase mb-3 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Subscription Status
            </h3>
            <p className={`text-2xl font-black mb-2 ${isSubscribed ? 'text-green-400' : 'text-gray-500'}`}>
              {isSubscribed ? '✓ Active' : '○ Inactive'}
            </p>
            <p className="text-xs text-gray-500">
              {isSubscribed ? 'Push notifications are set up' : 'No active subscription'}
            </p>
          </div>
        </div>

        {/* Setup Section */}
        <div className="bg-gray-900 border-4 border-gray-800 p-8 mb-8 space-y-6">
          <h2 className="text-2xl font-black uppercase" style={{ color: '#FFEA00' }}>Setup Instructions</h2>

          {/* Reminder Time */}
          <div>
            <label className="block text-sm font-bold uppercase text-gray-400 mb-2">Daily Reminder Time</label>
            <div className="flex gap-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  setReminderTime(e.target.value);
                  localStorage.setItem('habitsReminderTime', e.target.value);
                }}
                className="bg-black border-2 border-gray-700 text-white px-4 py-2 font-mono focus:border-yellow-300 focus:outline-none"
              />
              <p className="text-xs text-gray-500 flex items-center">Currently set to {reminderTime} AM</p>
            </div>
          </div>

          {/* Enable Button */}
          <div>
            <button
              onClick={requestNotificationPermission}
              disabled={notificationPermission === 'granted'}
              className={`w-full py-4 font-black uppercase text-lg transition-all ${
                notificationPermission === 'granted'
                  ? 'bg-green-900 border-4 border-green-500 text-green-400 cursor-not-allowed'
                  : 'bg-yellow-300 text-black border-4 border-yellow-300 hover:bg-yellow-200'
              }`}
            >
              {notificationPermission === 'granted' ? '✓ Notifications Enabled' : 'Enable Notifications'}
            </button>
          </div>

          {/* Test Button */}
          {notificationPermission === 'granted' && (
            <button
              onClick={showTestNotification}
              className="w-full py-3 bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 font-bold uppercase text-sm"
            >
              📬 Send Test Notification
            </button>
          )}
        </div>

        {/* Feature Info */}
        <div className="bg-gray-950 border-2 border-gray-700 p-6 space-y-4 mb-8">
          <h3 className="font-bold uppercase text-yellow-300">What You Get</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ Daily reminder at your selected time (default 7:00 AM)</li>
            <li>✓ "Time for today's devotional!" notification</li>
            <li>✓ Click to open app directly</li>
            <li>✓ Works even if browser is closed (Web Push API)</li>
            <li>✓ No spam—one reminder per day</li>
          </ul>
        </div>

        {/* Implementation Guide */}
        <div className="bg-black border-4 border-gray-800 p-6 space-y-4">
          <h3 className="font-bold uppercase text-yellow-300 mb-4">Implementation Guide (Backend Required)</h3>
          
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <p className="font-bold text-yellow-300 mb-1">Option 1: Firebase Cloud Messaging (Recommended)</p>
              <code className="bg-gray-950 p-2 block text-xs font-mono mb-2">npm install firebase</code>
              <p>Easiest: Firebase handles push scheduling automatically. Free tier supports unlimited notifications.</p>
            </div>

            <div>
              <p className="font-bold text-yellow-300 mb-1">Option 2: Custom Backend (Web Push API)</p>
              <code className="bg-gray-950 p-2 block text-xs font-mono mb-2">npm install web-push</code>
              <p>More control: Use Node.js + web-push library to schedule reminders. Requires server hosting.</p>
            </div>

            <div>
              <p className="font-bold text-yellow-300 mb-1">Step-by-Step:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>User clicks "Enable Notifications"</li>
                <li>Browser asks permission</li>
                <li>App sends subscription details to backend</li>
                <li>Backend stores subscription + reminder time</li>
                <li>Daily cron job sends push at scheduled time</li>
                <li>Service worker displays notification</li>
                <li>Click opens app</li>
              </ol>
            </div>
          </div>

          <button className="mt-6 w-full bg-gray-800 border-2 border-gray-700 hover:border-yellow-300 font-bold uppercase py-3 text-sm">
            📖 View Backend Setup Guide
          </button>
        </div>

        {/* Deployment Note */}
        <div className="mt-8 bg-yellow-950 border-4 border-yellow-600 p-6 text-center">
          <h3 className="font-bold text-yellow-400 mb-2">⏱️ POST-WEEK 1 FEATURE</h3>
          <p className="text-sm text-gray-300">
            Push notifications require backend setup. Collect student feedback from Week 1 first, then implement if demand is high.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== UTILITIES ====================
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default NotificationSetup;

/**
 * ==================== BACKEND SETUP (Node.js Example) ====================
 * 
 * Install: npm install web-push express
 * 
 * Generate VAPID Keys (one-time):
 * npx web-push generate-vapid-keys
 * Save the keys to .env
 * 
 * Express endpoint to receive subscriptions:
 * 
 * app.post('/api/subscribe', (req, res) => {
 *   const { subscription, reminderTime } = req.body;
 *   
 *   // Save to database
 *   db.push_subscriptions.insert({
 *     subscription: subscription,
 *     reminderTime: reminderTime,
 *     createdAt: new Date()
 *   });
 *   
 *   res.json({ success: true });
 * });
 * 
 * Send notification to specific user:
 * 
 * const webpush = require('web-push');
 * webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
 * 
 * async function sendReminderNotification(subscription) {
 *   const notification = {
 *     title: '📖 Time for Today\'s Devotional',
 *     body: 'Your daily reading, S.O.A.P., and prayers are waiting. Let\'s start your day with Scripture!',
 *     badge: 'https://your-domain.com/badge.png',
 *     icon: 'https://your-domain.com/icon.png',
 *     tag: 'habits-reminder',
 *     requireInteraction: false,
 *     actions: [
 *       { action: 'open', title: 'Open App' },
 *       { action: 'dismiss', title: 'Later' }
 *     ]
 *   };
 * 
 *   try {
 *     await webpush.sendNotification(subscription, JSON.stringify(notification));
 *     console.log('Notification sent');
 *   } catch (error) {
 *     console.error('Error sending notification:', error);
 *   }
 * }
 * 
 * Cron job (using node-cron):
 * 
 * const cron = require('node-cron');
 * 
 * cron.schedule('0 7 * * *', async () => {
 *   const subscriptions = db.push_subscriptions.find({ reminderTime: '07:00' });
 *   for (const sub of subscriptions) {
 *     await sendReminderNotification(sub.subscription);
 *   }
 * });
 */
