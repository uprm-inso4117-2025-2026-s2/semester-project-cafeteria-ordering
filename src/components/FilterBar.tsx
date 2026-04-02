import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SortField = "customer" | "date" | "orderNumber";
type SortDirection = "asc" | "desc";

interface FilterBarProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

interface FilterButtonProps {
  field: SortField;
  label: string;
  isActive: boolean;
  sortDirection: SortDirection;
  onPress: (field: SortField) => void;
}

function FilterButton({
  field,
  label,
  isActive,
  sortDirection,
  onPress,
}: FilterButtonProps) {
  const shouldPointUp = isActive && sortDirection === "asc";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(field)}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>

      <View
        style={[
          styles.arrowContainer,
          !shouldPointUp && styles.arrowContainerRotated,
        ]}
      >
        <Text
          style={[
            styles.arrowText,
            { opacity: isActive ? 0.7 : 0.44 },
          ]}
        >
          ▲
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function FilterBar({
  sortField,
  sortDirection,
  onSortChange,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <FilterButton
        field="customer"
        label="Customer"
        isActive={sortField === "customer"}
        sortDirection={sortDirection}
        onPress={onSortChange}
      />
      <FilterButton
        field="date"
        label="Date"
        isActive={sortField === "date"}
        sortDirection={sortDirection}
        onPress={onSortChange}
      />
      <FilterButton
        field="orderNumber"
        label="Order #"
        isActive={sortField === "orderNumber"}
        sortDirection={sortDirection}
        onPress={onSortChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  button: {
    backgroundColor: "#c8c8c8",
    minHeight: 33,
    paddingHorizontal: 5 ,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 0,
  },
  buttonText: {
    fontSize: 18,
    color: "#303030",
  },
  arrowContainer: {
    width: 15,
    height: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowContainerRotated: {
    transform: [{ rotate: "180deg" }],
  },
  arrowText: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 12,
  },
});
// //import svgPaths from "../../imports/svg-2ltvnydwm6";

// type SortField = "customer" | "date" | "orderNumber";
// type SortDirection = "asc" | "desc";

// interface FilterBarProps {
//   sortField: SortField;
//   sortDirection: SortDirection;
//   onSortChange: (field: SortField) => void;
// }

// export function FilterBar({ sortField, sortDirection, onSortChange }: FilterBarProps) {
//   const FilterButton = ({ 
//     field, 
//     label 
//   }: { 
//     field: SortField; 
//     label: string;
//   }) => {
//     const isActive = sortField === field;
    
//     return (
//       <button
//         onClick={() => onSortChange(field)}
//         className="bg-[#c8c8c8] h-[33px] px-4 rounded-[8px] flex items-center gap-2 hover:bg-[#b8b8b8] transition-colors"
//       >
//         <span className="text-[20px] text-[#303030] whitespace-nowrap">{label}</span>
//         <div className={`w-[15px] h-[13px] flex items-center justify-center transition-transform ${
//           isActive && sortDirection === 'asc' ? '' : 'rotate-180'
//         }`}>
//           <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.2582 8.9463">
//             <g>
//               <path d={svgPaths.p32f2f200} fill="#D9D9D9" />
//               <path d={svgPaths.p32f2f200} fill="black" fillOpacity={isActive ? "0.7" : "0.44"} />
//             </g>
//           </svg>
//         </div>
//       </button>
//     );
//   };

//   return (
//     <div className="flex gap-3 flex-wrap">
//       <FilterButton field="customer" label="Customer" />
//       <FilterButton field="date" label="Date Created" />
//       <FilterButton field="orderNumber" label="Order Number" />
//     </div>
//   );
// }