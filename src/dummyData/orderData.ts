export interface OrderItem {
  name: string;
  quantity: number;
  modifications: string[];
}

export interface Order {
  id: number;
  orderNumber: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
  status: "unread" | "open" | "finished";
}

export const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 1,
    customerName: "Juan del Pueblo",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
      {
        name: "Quesito",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
      
    ],
  },
  {
    id: 2,
    orderNumber: 2,
    customerName: "Customer Name",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
    ],
  },
  {
    id: 3,
    orderNumber: 3,
    customerName: "Customer Name",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
        {
        name: "Quesito",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
    ],
  },
  {
    id: 4,
    orderNumber: 4,
    customerName: "Customer Name",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
        {
        name: "Quesito",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
    ],
  },
  {
    id: 5,
    orderNumber: 5,
    customerName: "Customer Name",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
    ],
  },
  {
    id: 6,
    orderNumber: 6,
    customerName: "Customer Name",
    createdAt: "created: 02/14/25 4:22 pm",
    status: "unread",
    items: [
      {
        name: "Sandwich",
        quantity: 1,
        modifications: ["EXTRA Lettuce", "American cheese"],
      },
      {
        name: "Quesadilla",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
            {
        name: "Quesito",
        quantity: 3,
        modifications: ["NO chicken", "EXTRA tomato"],
      },
    ],
  },
  {
    id: 7,
    orderNumber: 7,
    customerName: "Sarah Johnson",
    createdAt: "created: 02/14/25 3:45 pm",
    status: "open",
    items: [
      {
        name: "Burger",
        quantity: 2,
        modifications: ["NO pickles", "Add bacon"],
      },
      {
        name: "Fries",
        quantity: 2,
        modifications: ["EXTRA salt"],
      },
    ],
  },
  {
    id: 8,
    orderNumber: 8,
    customerName: "Mike Chen",
    createdAt: "created: 02/14/25 3:30 pm",
    status: "open",
    items: [
      {
        name: "Salad",
        quantity: 1,
        modifications: ["Dressing on the side", "NO onions"],
      },
    ],
  },
  {
    id: 9,
    orderNumber: 9,
    customerName: "Emily Davis",
    createdAt: "created: 02/14/25 2:15 pm",
    status: "finished",
    items: [
      {
        name: "Pizza",
        quantity: 1,
        modifications: ["EXTRA cheese", "Thin crust"],
      },
      {
        name: "Soda",
        quantity: 2,
        modifications: [],
      },
    ],
  },
  {
    id: 10,
    orderNumber: 10,
    customerName: "James Wilson",
    createdAt: "created: 02/14/25 1:50 pm",
    status: "finished",
    items: [
      {
        name: "Tacos",
        quantity: 4,
        modifications: ["Mild sauce", "NO sour cream"],
      },
    ],
  },
];
