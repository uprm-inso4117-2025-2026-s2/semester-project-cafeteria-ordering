import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'

export async function registerForPushNotifications(userId: string) {
  const { status } = await Notifications.requestPermissionsAsync()

  if (status !== 'granted') {throw new Error('Notification permission not granted')}

  //create token
  const token = (await Notifications.getExpoPushTokenAsync()).data

  //save token into database
  const { error } = await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId)

  if (error) {
  console.error('Error saving push token:', error.message)
  }

  return token
}