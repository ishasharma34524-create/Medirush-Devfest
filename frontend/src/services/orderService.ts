import type { ActiveOrder, HistoricalOrder, OrderTimelineStep, OrderStatus } from '../types/patient';
import type { FulfillmentPlan } from '../types/pharmacy';
import type { ExtractedMedicine } from '../types/prescription';

export const INITIAL_HISTORICAL_ORDERS: HistoricalOrder[] = [
  {
    id: 'ord-hist-1',
    orderNumber: 'MR-79102',
    date: '18 Sep 2026',
    medicinesCount: 3,
    medicinesSummary: 'Telma-H, Glycomet-GP 2, Pan-D',
    totalAmount: 480,
    status: 'delivered',
    pharmaciesCount: 1
  },
  {
    id: 'ord-hist-2',
    orderNumber: 'MR-62091',
    date: '12 Aug 2026',
    medicinesCount: 2,
    medicinesSummary: 'Augmentin 625, Allegra 120',
    totalAmount: 390,
    status: 'delivered',
    pharmaciesCount: 2
  }
];

export function createOrderFromFulfillment(
  medicines: ExtractedMedicine[],
  plan: FulfillmentPlan,
  address = 'Flat 402, Green Glen Heights, Bellandur, Bengaluru'
): ActiveOrder {
  const orderId = `ord_${Date.now().toString().slice(-6)}`;
  const orderNumber = `MR-${Math.floor(10000 + Math.random() * 90000)}`;

  const totalAmount = medicines.reduce((acc, med) => {
    const isGeneric = med.selectedVariant === 'generic' && med.genericAlternative;
    const price = isGeneric ? med.genericAlternative!.price : med.unitPrice;
    return acc + price * med.quantity;
  }, 0);

  const timeline: OrderTimelineStep[] = [
    {
      status: 'placed',
      label: 'Order Placed',
      description: 'Prescription matched with partner pharmacies',
      time: 'Just now',
      isComplete: true,
      isCurrent: false
    },
    {
      status: 'verification',
      label: 'Pharmacist Verification',
      description: 'Rx dosage and cold-chain compliance verified',
      time: '1 min ago',
      isComplete: true,
      isCurrent: false
    },
    {
      status: 'confirmed',
      label: 'Medicines Confirmed',
      description: `Stock locked at ${plan.totalPharmaciesUsed} pharmacy location(s)`,
      time: 'Live',
      isComplete: true,
      isCurrent: false
    },
    {
      status: 'preparing',
      label: 'Preparing Medicines',
      description: 'Dispensing and tamper-proof temperature sealing',
      time: 'In progress',
      isComplete: false,
      isCurrent: true
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'MediRush rush courier en route',
      isComplete: false,
      isCurrent: false
    },
    {
      status: 'delivered',
      label: 'Delivered',
      description: 'Doorstep handover with OTP confirmation',
      isComplete: false,
      isCurrent: false
    }
  ];

  return {
    id: orderId,
    orderNumber,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'preparing',
    medicines,
    pharmacyMatches: plan.matches,
    estimatedDeliveryMinutes: plan.estimatedDeliveryMins,
    deliveryAddress: address,
    totalAmount,
    deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
    hasColdChain: medicines.some((m) => m.isColdChain),
    timeline
  };
}

export function advanceOrderStatus(order: ActiveOrder, newStatus: OrderStatus): ActiveOrder {
  const statusOrder: OrderStatus[] = [
    'placed',
    'verification',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered'
  ];

  const targetIdx = statusOrder.indexOf(newStatus);

  const updatedTimeline = order.timeline.map((step) => {
    const stepIdx = statusOrder.indexOf(step.status);
    return {
      ...step,
      isComplete: stepIdx < targetIdx,
      isCurrent: stepIdx === targetIdx
    };
  });

  return {
    ...order,
    status: newStatus,
    timeline: updatedTimeline
  };
}
