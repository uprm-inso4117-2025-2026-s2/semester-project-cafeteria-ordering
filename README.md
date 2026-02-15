# Cafeteria Ordering App

## Prerequisites

- Node.js >= 18
- npm
- Expo Go app OR Android Studio (for emulator)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo


3. Using Expo Go

   When Expo starts, you will see a QR code. Install Expo Go on your phone and scan the QR code. The app will load directly from your computer through the local server. You can also use the localhost link to see the app in your browser.



4. Useful Expo Terminal Commands

   While Expo is running, you can use these keyboard shortcuts in the terminal:

   s → Switch to development build
   a → Open Android emulator
   w → Open in web browser
   j → Open debugger
   r → Reload the app
   m → Toggle developer menu
   Shift + m → Open more developer tools
   o → Open project in your code editor
   ? → Show all available commands


5. Debug

   to check if node.js is installed you can use.
      node -v
      npm -v

   if running npm -v or npm install generates a security error (PSSecurityException)
   Check your execution policy with

      Get-ExecutionPolicy -List

   if it generates something like this

      Scope           ExecutionPolicy
      MachinePolicy   Undefined
      UserPolicy      Undefined
      Process         Undefined
      CurrentUser     Undefined
      LocalMachine    AllSigned

   In order to change LocalMachine you will use

      Set-ExecutionPolicy RemoteSigned -Force

   this should make it so that the execution policy is shown as RemoteSigned. After this all the comands should work.
