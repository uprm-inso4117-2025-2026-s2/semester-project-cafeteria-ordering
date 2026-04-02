import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { mockOrders } from "@/dummyData/orderData";
import lightLogo from "../../../documentation/branding/images/Light-Mode-Logo.png";
import { FilterBar } from "../../components/FilterBar";
import { OrderCard } from "../../components/OrderCard";
import { TabNav } from "../../components/TabNav";

type Tab = "unread" | "open" | "finished";
type SortField = "customer" | "date" | "orderNumber";
type SortDirection = "asc" | "desc";

export default function ViewOrders() {
  const [activeTab, setActiveTab] = useState<Tab>("unread");
  const [sortField, setSortField] = useState<SortField>("orderNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleOrderPress = (orderId: string) => {
    console.log("Pressed order:", orderId);
    // put navigation here later
    // example: router.push(`/orders/${orderId}`)
  };

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = mockOrders
      .filter((order) => order.status === activeTab)
      .slice();

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "customer":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "date":
          comparison = a.createdAt.localeCompare(b.createdAt);
          break;
        case "orderNumber":
          comparison = a.orderNumber - b.orderNumber;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [activeTab, sortField, sortDirection]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Image
              source={lightLogo}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.filterContainer}>
              <FilterBar
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.tabSection}>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </View>

        <View style={styles.ordersSection}>
          <View style={styles.ordersList}>
            {filteredAndSortedOrders.map((order) => (
              <Pressable
                key={order.id}
                style={({ pressed }) => [
                  styles.orderCardWrapper,
                  pressed && styles.orderCardPressed,
                ]}
                onPress={() => handleOrderPress("placeholder")}
              >
                <OrderCard
                  orderNumber={order.orderNumber}
                  customerName={order.customerName}
                  createdAt={order.createdAt}
                  items={order.items}
                  status={order.status}
                />
              </Pressable>
            ))}
          </View>

          {filteredAndSortedOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {activeTab} orders at the moment
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#d9d9d9",
    borderColor: "#a8a8a8",
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingBottom: 0,
    paddingTop: 35,
    gap: 0,
  },
  logo: {
    width: 64,
    height: 64,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 3,
  },
  filterContainer: {
    flex: 1,
  },
  tabSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  ordersSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  ordersList: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch", // 👈 important
  },
  orderCardWrapper: {
    width: "48%",
    marginBottom: 24,
  },
  orderCardPressed: {
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 24,
    color: "#424242",
    textAlign: "center",
  },
});

// import { Image } from "expo-image";
// import React, { useMemo, useState } from "react";
// import { ScrollView, StyleSheet, Text, View } from "react-native";

// import { mockOrders } from "@/dummyData/orderData";
// import lightLogo from "../../../documentation/branding/images/Light-Mode-Logo.png";
// import { FilterBar } from "./components/FilterBar";
// import { OrderCard } from "./components/OrderCard";
// import { TabNav } from "./components/TabNav";

// type Tab = "unread" | "open" | "finished";
// type SortField = "customer" | "date" | "orderNumber";
// type SortDirection = "asc" | "desc";

// export default function ViewOrders() {
//   const [activeTab, setActiveTab] = useState<Tab>("unread");
//   const [sortField, setSortField] = useState<SortField>("orderNumber");
//   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

//   const handleSortChange = (field: SortField) => {
//     if (sortField === field) {
//       setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   const filteredAndSortedOrders = useMemo(() => {
//     const filtered = mockOrders
//       .filter((order) => order.status === activeTab)
//       .slice();

//     filtered.sort((a, b) => {
//       let comparison = 0;

//       switch (sortField) {
//         case "customer":
//           comparison = a.customerName.localeCompare(b.customerName);
//           break;
//         case "date":
//           comparison = a.createdAt.localeCompare(b.createdAt);
//           break;
//         case "orderNumber":
//           comparison = a.orderNumber - b.orderNumber;
//           break;
//       }

//       return sortDirection === "asc" ? comparison : -comparison;
//     });

//     return filtered;
//   }, [activeTab, sortField, sortDirection]);

//   return (
//     <View style={styles.screen}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <View style={styles.headerInner}>
//             <Image
//               source={lightLogo}
//               style={styles.logo}
//               contentFit="contain"
//             />
//             <View style={styles.filterContainer}>
//               <FilterBar
//                 sortField={sortField}
//                 sortDirection={sortDirection}
//                 onSortChange={handleSortChange}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={styles.tabSection}>
//           <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
//         </View>

//         <View style={styles.ordersSection}>
//           <View style={styles.ordersList}>
//             {filteredAndSortedOrders.map((order) => (
//               <View key={order.id} style={styles.orderCardWrapper}>
//                 <OrderCard
//                   orderNumber={order.orderNumber}
//                   customerName={order.customerName}
//                   createdAt={order.createdAt}
//                   items={order.items}
//                 />
//               </View>
//             ))}
//           </View>

//           {filteredAndSortedOrders.length === 0 && (
//             <View style={styles.emptyState}>
//               <Text style={styles.emptyStateText}>
//                 No {activeTab} orders at the moment
//               </Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: "#fafafa",
//   },
//   scrollContent: {
//     paddingBottom: 32,
//   },
//   header: {
//     backgroundColor: "#d9d9d9",
//     borderColor: "#a8a8a8",
//     borderWidth: 1,
//     borderTopWidth: 0,
//     borderBottomLeftRadius: 5,
//     borderBottomRightRadius: 5,
//     shadowColor: "#000000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.4,
//     shadowRadius: 1,
//     elevation: 3,
//   },
//   headerInner: {
//     flexDirection: "row",
//     alignItems: "center",
//     columnGap: 16,
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//   },
//   logo: {
//     width: 64,
//     height: 64,
//   },
//   filterContainer: {
//     flex: 1,
//   },
//   tabSection: {
//     paddingHorizontal: 24,
//     paddingTop: 32,
//     paddingBottom: 16,
//   },
//   ordersSection: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingVertical: 32,
//   },
//   ordersList: {
//     width: "100%",
//     maxWidth: 1200,
//     alignSelf: "center",
//     gap: 24,
//   },
//   orderCardWrapper: {
//     width: "100%",
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 48,
//   },
//   emptyStateText: {
//     fontSize: 24,
//     color: "#424242",
//     textAlign: "center",
//   },
// });