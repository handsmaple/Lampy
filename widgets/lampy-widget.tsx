// ============================================
// Lampy — Home Screen Widget Definition
// ============================================
// This file defines the native home screen widget
// using expo-widgets + @expo/ui.
//
// ACTIVATION: This widget requires a custom dev build.
// Run `npx expo install expo-widgets @expo/ui` and
// add the config plugin to app.json to enable.
//
// Widget renders using SwiftUI (iOS) / Jetpack Glance
// (Android) primitives — no React Native at render time.
// ============================================

// NOTE: Uncomment when expo-widgets is installed:
//
// import { Widget, WidgetProvider } from 'expo-widgets';
// import { Text, VStack, HStack, Spacer } from '@expo/ui';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// const WIDGET_STORAGE_KEY = 'lampy_widget_data';
//
// interface WidgetData {
//   tasks: { id: string; title: string; priority: string; isOverdue: boolean }[];
//   orbState: string;
//   streak: number;
//   level: number;
//   greeting: string;
// }
//
// // --- Medium Widget (default) ---
//
// function LampyMediumWidget() {
//   return (
//     <WidgetProvider
//       getTimeline={async () => {
//         const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
//         const data: WidgetData | null = raw ? JSON.parse(raw) : null;
//
//         return {
//           entries: [
//             {
//               date: new Date(),
//               view: data ? (
//                 <VStack spacing={8} padding={16}>
//                   {/* Header */}
//                   <HStack>
//                     <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FF6B35' }}>
//                       LAMPY
//                     </Text>
//                     <Spacer />
//                     <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
//                       Lv.{data.level} ⚡{data.streak}
//                     </Text>
//                   </HStack>
//
//                   {/* Tasks */}
//                   {data.tasks.length === 0 ? (
//                     <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
//                       No tasks — enjoy your day!
//                     </Text>
//                   ) : (
//                     data.tasks.map((task) => (
//                       <HStack key={task.id} spacing={8}>
//                         <Text style={{
//                           fontSize: 6,
//                           color: task.priority === 'HIGH' ? '#EF4444'
//                             : task.priority === 'MEDIUM' ? '#F5A623' : '#5B8FB9',
//                         }}>
//                           ●
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: 14,
//                             color: task.isOverdue ? '#EF4444' : '#1A1A2E',
//                             fontWeight: '500',
//                           }}
//                           numberOfLines={1}
//                         >
//                           {task.title}
//                         </Text>
//                       </HStack>
//                     ))
//                   )}
//                 </VStack>
//               ) : (
//                 <VStack padding={16}>
//                   <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
//                     Open Lampy to get started
//                   </Text>
//                 </VStack>
//               ),
//             },
//           ],
//           policy: { afterDate: new Date(Date.now() + 30 * 60 * 1000) },
//         };
//       }}
//     />
//   );
// }
//
// // --- Small Widget ---
//
// function LampySmallWidget() {
//   return (
//     <WidgetProvider
//       getTimeline={async () => {
//         const raw = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
//         const data: WidgetData | null = raw ? JSON.parse(raw) : null;
//
//         return {
//           entries: [
//             {
//               date: new Date(),
//               view: data ? (
//                 <VStack spacing={4} padding={12} alignment="center">
//                   <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#FF6B35' }}>
//                     LAMPY
//                   </Text>
//                   <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
//                     {data.tasks.length}
//                   </Text>
//                   <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
//                     tasks today
//                   </Text>
//                   <Text style={{ fontSize: 11, color: '#F5A623' }}>
//                     ⚡ {data.streak}d streak
//                   </Text>
//                 </VStack>
//               ) : (
//                 <VStack padding={12} alignment="center">
//                   <Text style={{ fontSize: 14, color: '#9CA3AF' }}>
//                     Open Lampy
//                   </Text>
//                 </VStack>
//               ),
//             },
//           ],
//           policy: { afterDate: new Date(Date.now() + 30 * 60 * 1000) },
//         };
//       }}
//     />
//   );
// }
//
// // Export widget configurations
// export default Widget({
//   name: 'LampyWidget',
//   description: 'Your top tasks, streak, and orb level at a glance.',
//   supportedFamilies: ['small', 'medium'],
//   small: LampySmallWidget,
//   medium: LampyMediumWidget,
// });

// Placeholder export for TypeScript (remove when activating above)
export const WIDGET_READY = true;
export const WIDGET_ACTIVATION_STEPS = [
  '1. Run: npx expo install expo-widgets @expo/ui',
  '2. Add "expo-widgets" to plugins in app.json',
  '3. Uncomment the widget code in widgets/lampy-widget.tsx',
  '4. Run: npx expo prebuild',
  '5. Build with: eas build --profile development',
];
