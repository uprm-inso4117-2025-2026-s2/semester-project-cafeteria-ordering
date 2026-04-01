import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrderItem {
  name: string;
  quantity?: number;
}

type OrderTab = "unread" | "open" | "finished";

interface OrderCardProps {
  orderNumber: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[] | string[];
  status: OrderTab;
}

export function OrderCard({
  orderNumber,
  customerName,
  createdAt,
  items,
  status,
}: OrderCardProps) {
  const visibleItems = items.slice(0, 2);
  const showViewMore = items.length > 2;

  const avatarStyle = [
    styles.avatarDot,
    status === "unread" && styles.avatarUnread,
    status === "open" && styles.avatarOpen,
    status === "finished" && styles.avatarFinished,
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={avatarStyle} />

          <View style={styles.headerTextContainer}>
            <Text style={styles.orderTitle}>Order #{orderNumber}</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.dateText}>{createdAt}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.itemsTitle}>Items</Text>

        <View style={styles.itemsList}>
          {visibleItems.map((item, index) => {
            const itemLabel =
              typeof item === "string"
                ? item
                : `${item.name}${item.quantity ? ` x${item.quantity}` : ""}`;

            return (
              <Text key={`${itemLabel}-${index}`} style={styles.itemText}>
                • {itemLabel}
              </Text>
            );
          })}
        </View>

        {showViewMore && <Text style={styles.viewMoreText}>View more</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BDBDBD",
    flex: 1,
  },
  header: {
    backgroundColor: "#FFCCBC",
    borderBottomWidth: 2,
    borderBottomColor: "#BDBDBD",
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 12,
  },
  avatarDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 4,
    flexShrink: 0,
  },
  avatarUnread: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  avatarOpen: {
    backgroundColor: "#A5D6A7",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  avatarFinished: {
    backgroundColor: "#FFCCBC",
    borderWidth: 0,
  },
  headerTextContainer: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: "#000000",
    marginBottom: 2,
    fontWeight: "400",
  },
  customerName: {
    fontSize: 12,
    lineHeight: 14,
    color: "#828282",
    marginBottom: 2,
    fontWeight: "400",
  },
  dateText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#828282",
    fontWeight: "400",
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
  },
  itemsTitle: {
    fontSize: 20,
    color: "#000000",
    marginBottom: 12,
    fontWeight: "600",
  },
  itemsList: {
    gap: 8,
  },
  itemText: {
    fontSize: 18,
    color: "#303030",
    lineHeight: 24,
  },
  viewMoreText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 16,
    color: "#303030",
    fontWeight: "600",
  },
});



// import React from "react";
// import { StyleSheet, Text, View } from "react-native";

// interface OrderItem {
//   name: string;
//   quantity?: number;
// }

// interface OrderCardProps {
//   orderNumber: number;
//   customerName: string;
//   createdAt: string;
//   items: OrderItem[] | string[];
// }

// export function OrderCard({
//   orderNumber,
//   customerName,
//   createdAt,
//   items,
// }: OrderCardProps) {
//   const visibleItems = items.slice(0, 2);
//   const showViewMore = items.length > 2;

//   return (
//     <View style={styles.card}>
//       <View style={styles.header}>
//         <View style={styles.headerRow}>
//           <View style={styles.avatarDot} />

//           <View style={styles.headerTextContainer}>
//             <Text style={styles.orderTitle}>Order #{orderNumber}</Text>
//             <Text style={styles.customerName}>{customerName}</Text>
//             <Text style={styles.dateText}>{createdAt}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.body}>
//         <Text style={styles.itemsTitle}>Items</Text>

//         <View style={styles.itemsList}>
//           {visibleItems.map((item, index) => {
//             const itemLabel =
//               typeof item === "string"
//                 ? item
//                 : `${item.name}${item.quantity ? ` x${item.quantity}` : ""}`;

//             return (
//               <Text key={`${itemLabel}-${index}`} style={styles.itemText}>
//                 • {itemLabel}
//               </Text>
//             );
//           })}
//         </View>

//         {showViewMore && <Text style={styles.viewMoreText}>View more</Text>}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     width: "100%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#BDBDBD",
//     flex:1
//   },
//   header: {
//     backgroundColor: "#FFCCBC",
//     borderBottomWidth: 2,
//     borderBottomColor: "#BDBDBD",
//     paddingHorizontal: 5,
//     paddingVertical: 6,
//   },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     columnGap: 12,
//   },
//   avatarDot: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#FAFAFA",
//     marginTop: 4,
//     flexShrink: 0,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   orderTitle: {
//     fontSize: 20,
//     lineHeight: 24,
//     color: "#000000",
//     marginBottom: 2,
//     fontWeight: "400",
//   },
//   customerName: {
//     fontSize: 12,
//     lineHeight: 14,
//     color: "#828282",
//     marginBottom: 2,
//     fontWeight: "400",
//   },
//   dateText: {
//     fontSize: 12,
//     lineHeight: 14,
//     color: "#828282",
//     fontWeight: "400",
//   },
//   body: {
//     paddingHorizontal: 16,
//     paddingVertical: 5,
//     backgroundColor: "#FFFFFF",
//   },
//   itemsTitle: {
//     fontSize: 20,
//     color: "#000000",
//     marginBottom: 12,
//     fontWeight: "600",
//   },
//   itemsList: {
//     gap: 8,
//   },
//   itemText: {
//     fontSize: 18,
//     color: "#303030",
//     lineHeight: 24,
//   },
//   viewMoreText: {
//     marginTop: 12,
//     textAlign: "center",
//     fontSize: 16,
//     color: "#303030",
//     fontWeight: "600",
//   },
// });














// interface OrderItem {
//   name: string;
//   quantity: number;
//   modifications: string[];
// }

// interface OrderCardProps {
//   orderNumber: number;
//   customerName: string;
//   createdAt: string;
//   items: OrderItem[];
// }

// export function OrderCard({ orderNumber, customerName, createdAt, items }: OrderCardProps) {
//   return (
//     <div className="bg-[#eee] border-2 border-[#bdbdbd] rounded-[10px] overflow-hidden">
//       {/* Header */}
//       <div className="bg-[#ffccbc] border-b-2 border-[#bdbdbd] px-4 py-3">
//         <div className="flex items-start gap-3">
//           <div className="size-[24px] bg-[#fafafa] rounded-full flex-shrink-0 mt-1" />
//           <div className="flex-1">
//             <h3 className="text-[36px] leading-[1.1] text-black mb-1">
//               Order #{orderNumber}
//             </h3>
//             <p className="text-[16px] text-[#424242] mb-0.5">{customerName}</p>
//             <p className="text-[16px] text-[#424242]">{createdAt}</p>
//           </div>
//         </div>
//       </div>

//       {/* Order Items */}
//       <div className="px-4 py-4">
//         <div className="text-[20px] text-[#424242] space-y-2">
//           {items.map((item, idx) => (
//             <div key={idx}>
//               <p className="mb-1">
//                 {item.quantity} {item.name}
//               </p>
//               {item.modifications.length > 0 && (
//                 <ul className="list-disc ml-[30px] mb-2">
//                   {item.modifications.map((mod, modIdx) => (
//                     <li key={modIdx}>{mod}</li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
