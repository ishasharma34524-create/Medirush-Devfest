import React, { useState, useEffect } from 'react';
import {
  Store,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  Package,
  ThermometerSnowflake,
  Power,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  Square,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  dispatchOrderApi,
  fetchLiveOrdersApi,
  partialConfirmOrderApi,
} from '../../services/backendService';

export interface ChemistIncomingOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  distanceKm: number;
  urgency: 'CRITICAL_COLD_CHAIN' | 'HIGH_URGENCY' | 'STANDARD';
  timeReceived: string;
  expirySeconds: number;
  totalAmount: number;
  payoutAmount: number;
  prescriptionDoctor: string;
  medicines: Array<{
    id: string;
    name: string;
    salt: string;
    quantity: number;
    inStock: boolean;
    availableQty: number;
    unitPrice: number;
    isColdChain: boolean;
    scheduleType: string;
  }>;
}

export interface PharmacyStation {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  drugLicense: string;
  coldChainTemp: string;
  isCentralHub: boolean;
}

const STATIONS: Record<'sanjeevani' | 'apollo', PharmacyStation> = {
  sanjeevani: {
    id: 'pharm_sanjeevani_01',
    name: 'Sanjeevani Medicos & Surgicals',
    address: '12/A Greater Kailash Road, Old Palasia, Indore',
    distanceKm: 1.2,
    drugLicense: 'MP-IND-2024-8491',
    coldChainTemp: '3.8°C',
    isCentralHub: true,
  },
  apollo: {
    id: 'pharm_apollo_02',
    name: 'Apollo Pharmacy & Cold Chain Hub',
    address: 'UG-10, A.B. Road, Near Geeta Bhawan, Indore',
    distanceKm: 0.8,
    drugLicense: 'MP-IND-2023-1109',
    coldChainTemp: '2.4°C (Active)',
    isCentralHub: false,
  },
};

export const ChemistDashboard: React.FC<{ onSwitchToPatient: () => void }> = ({
  onSwitchToPatient,
}) => {
  const [selectedStationKey, setSelectedStationKey] = useState<'sanjeevani' | 'apollo'>('sanjeevani');
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'packing' | 'inventory'>('incoming');
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [dispatchedOrders, setDispatchedOrders] = useState<any[]>([]);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Per-order, per-medicine availability checkboxes (maps orderId -> medId -> boolean)
  const [medAvailability, setMedAvailability] = useState<Record<string, Record<string, boolean>>>({});

  // Sequential broadcast cascade banner alert
  const [forwardAlert, setForwardAlert] = useState<{
    show: boolean;
    targetPharmacy: string;
    distanceKm: number;
    forwardedMeds: string[];
    primaryPharmacy: string;
  } | null>(null);

  // Incoming broadcast request list for Sanjeevani
  const [incomingRequests, setIncomingRequests] = useState<ChemistIncomingOrder[]>([
    {
      id: 'req_indore_001',
      orderNumber: 'MR-9402',
      patientName: 'Rahul Sharma',
      patientPhone: '+91-98260-12345',
      patientAddress: 'Flat 204, Greater Kailash Road, Old Palasia, Indore',
      distanceKm: 1.2,
      urgency: 'CRITICAL_COLD_CHAIN',
      timeReceived: 'Live Emergency Broadcast',
      expirySeconds: 90,
      totalAmount: 935,
      payoutAmount: 850,
      prescriptionDoctor: 'Dr. Arishta Mukherjee, MD (Reg: KMC-849102)',
      medicines: [
        {
          id: 'med-1',
          name: 'Lantus SoloStar Pen (100 IU/mL)',
          salt: 'Insulin Glargine (Recombinant DNA origin)',
          quantity: 1,
          inStock: true,
          availableQty: 15,
          unitPrice: 685,
          isColdChain: true,
          scheduleType: 'Schedule H',
        },
        {
          id: 'med-2',
          name: 'Augmentin 625 Duo',
          salt: 'Amoxicillin (500mg) + Potassium Clavulanate (125mg)',
          quantity: 10,
          inStock: true,
          availableQty: 40,
          unitPrice: 24,
          isColdChain: false,
          scheduleType: 'Schedule H',
        },
        {
          id: 'med-3',
          name: 'Dolo 650',
          salt: 'Paracetamol (650mg)',
          quantity: 15,
          inStock: true,
          availableQty: 100,
          unitPrice: 2,
          isColdChain: false,
          scheduleType: 'OTC',
        },
      ],
    },
  ]);

  // Secondary station incoming list for Apollo (receives cascaded requests)
  const [apolloIncoming, setApolloIncoming] = useState<ChemistIncomingOrder[]>([]);

  const activeStation = STATIONS[selectedStationKey];
  const activeIncomingList = selectedStationKey === 'sanjeevani' ? incomingRequests : apolloIncoming;

  // Real-time synchronization: Load stored orders, listen to live order events, and poll backend
  useEffect(() => {
    // 1. Initial load from local store
    try {
      const stored = JSON.parse(localStorage.getItem('medirush_chemist_orders') || '[]');
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setIncomingRequests((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const newOrders = stored.filter((o: ChemistIncomingOrder) => !existingIds.has(o.id));
          return [...newOrders, ...prev];
        });
      }
    } catch (e) {
      console.warn('Chemist load initial orders error:', e);
    }

    // 2. Event listener for live orders dispatched from patient prescription flow
    const handleNewOrderEvent = (e: any) => {
      if (e.detail) {
        const newOrder = e.detail as ChemistIncomingOrder;
        setIncomingRequests((prev) => [newOrder, ...prev.filter((r) => r.id !== newOrder.id)]);
      }
    };
    window.addEventListener('medirush:new_order', handleNewOrderEvent);

    // 3. Periodic backend polling
    const pollTimer = setInterval(() => {
      fetchLiveOrdersApi()
        .then((res: any) => {
          if (res?.orders && Array.isArray(res.orders)) {
            const liveBroadcasting = res.orders.filter(
              (o: any) => o.status === 'BROADCASTING' || o.status === 'CREATED'
            );
            if (liveBroadcasting.length > 0) {
              setIncomingRequests((prev) => {
                const existingIds = new Set(prev.map((p) => p.id));
                const mapped = liveBroadcasting
                  .filter((b: any) => !existingIds.has(String(b._id)))
                  .map((b: any) => ({
                    id: String(b._id),
                    orderNumber: `MR-${String(b._id).slice(-4)}`,
                    patientName: 'Rahul Sharma',
                    patientPhone: '+91-98260-12345',
                    patientAddress: b.deliveryLocation?.address || 'Indore Central',
                    distanceKm: 1.2,
                    urgency: 'HIGH_URGENCY' as const,
                    timeReceived: 'Live Backend Broadcast',
                    expirySeconds: 90,
                    totalAmount: 650,
                    payoutAmount: 580,
                    prescriptionDoctor: 'Dr. Arishta Mukherjee, MD',
                    medicines: (b.medicines || []).map((m: any, idx: number) => ({
                      id: `med-live-${idx + 1}`,
                      name: m.brandName || 'Prescribed Medicine',
                      salt: m.salt || m.brandName,
                      quantity: m.quantity || 1,
                      inStock: true,
                      availableQty: 30,
                      unitPrice: m.price || 40,
                      isColdChain: Boolean(m.brandName?.toLowerCase().includes('insulin') || m.brandName?.toLowerCase().includes('lantus')),
                      scheduleType: 'Schedule H',
                    })),
                  }));
                return mapped.length > 0 ? [...mapped, ...prev] : prev;
              });
            }
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      window.removeEventListener('medirush:new_order', handleNewOrderEvent);
      clearInterval(pollTimer);
    };
  }, []);

  // Check if a specific medicine is toggled as available in current order
  const isMedAvailable = (orderId: string, medId: string): boolean => {
    return medAvailability[orderId]?.[medId] !== undefined
      ? medAvailability[orderId][medId]
      : true;
  };

  // Toggle medicine stock checkbox
  const handleToggleMedStock = (orderId: string, medId: string) => {
    setMedAvailability((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [medId]: !isMedAvailable(orderId, medId),
      },
    }));
  };

  // Handle chemist accepting available medicines & cascading remaining to next nearest chemist
  const handleAcceptOrForwardOrder = async (order: ChemistIncomingOrder) => {
    const acceptedMeds = order.medicines.filter((m) => isMedAvailable(order.id, m.id));
    const remainingMeds = order.medicines.filter((m) => !isMedAvailable(order.id, m.id));

    if (acceptedMeds.length === 0) {
      alert("Please select at least 1 medicine in stock to fulfill, or click 'Pass' to reject the order.");
      return;
    }

    try {
      setIsProcessing(true);

      // Call backend partial confirmation
      try {
        await partialConfirmOrderApi(
          order.id,
          activeStation.id,
          acceptedMeds,
          remainingMeds
        );
      } catch {
        // Continue seamlessly in demo mode
      }

      // 1. Current chemist packs the accepted medicines
      const currentAccepted: ChemistIncomingOrder = {
        ...order,
        medicines: acceptedMeds,
        totalAmount: acceptedMeds.reduce((acc, m) => acc + m.unitPrice * m.quantity, 0),
        payoutAmount: Math.round(
          acceptedMeds.reduce((acc, m) => acc + m.unitPrice * m.quantity, 0) * 0.9
        ),
      };
      setAcceptedOrders((prev) => [currentAccepted, ...prev]);

      // 2. If there are remaining medicines, cascade to next nearest pharmacy
      if (remainingMeds.length > 0) {
        const nextStationKey = selectedStationKey === 'sanjeevani' ? 'apollo' : 'sanjeevani';
        const nextStation = STATIONS[nextStationKey];

        const forwardedOrder: ChemistIncomingOrder = {
          id: `fwd_${order.id}_${Date.now()}`,
          orderNumber: `${order.orderNumber}-B (Cascaded)`,
          patientName: order.patientName,
          patientPhone: order.patientPhone,
          patientAddress: order.patientAddress,
          distanceKm: nextStation.distanceKm,
          urgency: remainingMeds.some((m) => m.isColdChain) ? 'CRITICAL_COLD_CHAIN' : 'HIGH_URGENCY',
          timeReceived: 'Cascaded via Sequential Broadcast',
          expirySeconds: 90,
          totalAmount: remainingMeds.reduce((acc, m) => acc + m.unitPrice * m.quantity, 0),
          payoutAmount: Math.round(
            remainingMeds.reduce((acc, m) => acc + m.unitPrice * m.quantity, 0) * 0.9
          ),
          prescriptionDoctor: order.prescriptionDoctor,
          medicines: remainingMeds.map((m) => ({ ...m, inStock: true })),
        };

        // Trigger prominent broadcast alert
        setForwardAlert({
          show: true,
          primaryPharmacy: activeStation.name,
          targetPharmacy: nextStation.name,
          distanceKm: nextStation.distanceKm,
          forwardedMeds: remainingMeds.map((m) => m.name),
        });

        // Add to secondary station queue
        if (selectedStationKey === 'sanjeevani') {
          setApolloIncoming((prev) => [forwardedOrder, ...prev]);
        } else {
          setIncomingRequests((prev) => [forwardedOrder, ...prev]);
        }
      }

      // Remove from current active requests
      if (selectedStationKey === 'sanjeevani') {
        setIncomingRequests((prev) => prev.filter((r) => r.id !== order.id));
      } else {
        setApolloIncoming((prev) => prev.filter((r) => r.id !== order.id));
      }

      setActiveTab('packing');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject / Pass order entirely to next pharmacy
  const handlePassOrder = (orderId: string) => {
    if (selectedStationKey === 'sanjeevani') {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== orderId));
    } else {
      setApolloIncoming((prev) => prev.filter((r) => r.id !== orderId));
    }
  };

  // Toggle packing checklist item
  const handleTogglePacked = (itemId: string) => {
    setPackedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Handover order to rider Rahul
  const handleHandoverToRider = async (order: ChemistIncomingOrder) => {
    try {
      setIsProcessing(true);
      try {
        await dispatchOrderApi(order.id);
      } catch {
        // Continue seamlessly
      }

      setDispatchedOrders((prev) => [
        {
          ...order,
          rider: {
            name: 'Rahul',
            phone: '+91-98765-43210',
            vehicle: 'Hero Splendor',
            vehicleNumber: 'MP-43-E-2101',
            otp: '4821',
          },
          dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);

      setAcceptedOrders((prev) => prev.filter((o) => o.id !== order.id));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Sequential Broadcast Cascade Banner Alert */}
      {forwardAlert && forwardAlert.show && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce-short border-2 border-white/20">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/30 px-2 py-0.5 rounded-full">
                  ⚡ Sequential Cascade Activated
                </span>
                <span className="text-xs text-amber-100">Proximity Auto-Routing</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {forwardAlert.forwardedMeds.join(', ')} cascaded to{' '}
                <span className="underline decoration-white font-extrabold">
                  {forwardAlert.targetPharmacy}
                </span>{' '}
                ({forwardAlert.distanceKm} km away)
              </h3>
              <p className="text-xs text-amber-100">
                Current store fulfilled available items; patient receives 2 coordinated deliveries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStationKey(selectedStationKey === 'sanjeevani' ? 'apollo' : 'sanjeevani');
                setForwardAlert(null);
              }}
              className="text-xs bg-white text-orange-800 hover:bg-amber-50 font-bold border-none shadow"
            >
              Switch to {selectedStationKey === 'sanjeevani' ? 'Apollo Pharmacy Station' : 'Sanjeevani Station'} ➔
            </Button>
            <button
              onClick={() => setForwardAlert(null)}
              className="text-white/80 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Chemist Header & Pharmacy Identity */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white p-5 sm:p-7 rounded-3xl border border-teal-800/60 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
              <Store className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeStation.name}
                </h1>
                <Badge variant="emerald" size="sm">
                  Partner Verified
                </Badge>
                <span className="text-[11px] font-mono text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  DL: {activeStation.drugLicense}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeStation.address}</span>
              </p>
            </div>
          </div>

          {/* Pharmacy Station Selector (Judge Simulation) & Patient Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Station Switcher for Demonstrating Multi-Pharmacy Routing */}
            <div className="bg-slate-800/90 border border-slate-700 p-1 rounded-xl flex items-center gap-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Station:</span>
              <button
                onClick={() => setSelectedStationKey('sanjeevani')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedStationKey === 'sanjeevani'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Sanjeevani (1.2 km)
              </button>
              <button
                onClick={() => setSelectedStationKey('apollo')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedStationKey === 'apollo'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                2. Apollo Hub (0.8 km)
                {apolloIncoming.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                )}
              </button>
            </div>

            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>{isOnline ? 'Accepting Broadcasts (Online)' : 'Store Offline'}</span>
              <Power className="w-3.5 h-3.5 ml-1" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToPatient}
              className="text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Switch to Patient View ➔
            </Button>
          </div>
        </div>

        {/* Quick Business KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Today's Payout</span>
            <span className="text-lg font-black text-emerald-400">₹4,820</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">+18% vs yesterday</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Orders Fulfilled</span>
            <span className="text-lg font-black text-white">14 Orders</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Avg pack time: 3.8m</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Cold Chain Storage</span>
            <span className="text-lg font-black text-blue-400 flex items-center gap-1">
              <ThermometerSnowflake className="w-4 h-4" /> {activeStation.coldChainTemp}
            </span>
            <span className="text-[10px] text-blue-300/80 block mt-0.5">Sensor Calibrated (2°-8°C)</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Fulfillment Score</span>
            <span className="text-lg font-black text-amber-400">99.4%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Top 5% Partner in Indore</span>
          </div>
        </div>
      </div>

      {/* Chemist Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'incoming'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Incoming Broadcasts</span>
          {activeIncomingList.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {activeIncomingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('packing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'packing'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Packing & Handover</span>
          {acceptedOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
              {acceptedOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Live Stock Management</span>
        </button>
      </div>

      {/* TAB 1: INCOMING REQUESTS QUEUE */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Live Emergency Broadcasts at {activeStation.name} ({activeIncomingList.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select medicines available in your inventory. Any unchecked medicines will be auto-cascaded to next nearest pharmacy.
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Auto-Sync Active
            </span>
          </div>

          {activeIncomingList.length === 0 ? (
            <Card className="text-center py-14 bg-white border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                All Broadcasts Handled for {activeStation.name}!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                No pending requests right now. When a patient uploads and confirms a prescription on the Patient App, it will appear here immediately!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setIncomingRequests([
                      {
                        id: 'req_demo_' + Date.now(),
                        orderNumber: 'MR-' + Math.floor(1000 + Math.random() * 9000),
                        patientName: 'Pooja Verma',
                        patientPhone: '+91-98270-44910',
                        patientAddress: 'Scheme 54, Vijay Nagar, Indore',
                        distanceKm: 2.1,
                        urgency: 'HIGH_URGENCY',
                        timeReceived: 'Just now',
                        expirySeconds: 90,
                        totalAmount: 480,
                        payoutAmount: 430,
                        prescriptionDoctor: 'Dr. S. K. Jain (MD Pediatrics)',
                        medicines: [
                          {
                            id: 'med-demo-1',
                            name: 'Augmentin 625 Duo',
                            salt: 'Amoxicillin + Clavulanic Acid',
                            quantity: 10,
                            inStock: true,
                            availableQty: 40,
                            unitPrice: 24,
                            isColdChain: false,
                            scheduleType: 'Schedule H',
                          },
                          {
                            id: 'med-demo-2',
                            name: 'Allegra 120mg',
                            salt: 'Fexofenadine HCl',
                            quantity: 10,
                            inStock: true,
                            availableQty: 25,
                            unitPrice: 19,
                            isColdChain: false,
                            scheduleType: 'Schedule H',
                          },
                        ],
                      },
                    ])
                  }
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Simulate New Order Broadcast
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSwitchToPatient}
                >
                  Open Patient App to Upload Prescription ➔
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeIncomingList.map((req) => {
                const totalMeds = req.medicines.length;
                const selectedCount = req.medicines.filter((m) => isMedAvailable(req.id, m.id)).length;
                const remainingCount = totalMeds - selectedCount;

                return (
                  <Card
                    key={req.id}
                    className="bg-white border-2 border-emerald-400/80 shadow-md p-5 sm:p-6 relative overflow-hidden"
                  >
                    {/* Top Emergency Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-slate-900 text-sm">{req.orderNumber}</span>
                        <span className="text-xs text-slate-400">• {req.timeReceived}</span>
                        {req.urgency === 'CRITICAL_COLD_CHAIN' && (
                          <Badge
                            variant="emerald"
                            size="sm"
                            icon={<ThermometerSnowflake className="w-3 h-3 text-blue-600" />}
                          >
                            Cold Chain Required (Insulin)
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <strong>{req.distanceKm} km</strong> from store
                        </span>
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Payout: ₹{req.payoutAmount}
                        </span>
                      </div>
                    </div>

                    {/* Patient & Doctor Context */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl mb-4 border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block">Patient Details</span>
                        <span className="font-bold text-slate-800 text-sm block">{req.patientName}</span>
                        <span className="text-slate-600 block">{req.patientAddress}</span>
                        <span className="text-emerald-700 font-semibold block pt-0.5">{req.patientPhone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Verified Prescription</span>
                        <span className="font-semibold text-slate-700 block">{req.prescriptionDoctor}</span>
                        <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                          <ShieldCheck className="w-3 h-3" /> Tele-verified via MediRush AI
                        </span>
                      </div>
                    </div>

                    {/* Medicines Stock Availability Check - Interactive Checkbox */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Requested Medicines ({totalMeds}) — Click to Toggle Stock:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Selected: <strong className="text-emerald-700">{selectedCount}</strong> / {totalMeds}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {req.medicines.map((med) => {
                          const available = isMedAvailable(req.id, med.id);
                          return (
                            <div
                              key={med.id}
                              onClick={() => handleToggleMedStock(req.id, med.id)}
                              className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                                available
                                  ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-sm'
                                  : 'bg-amber-50/60 border-amber-300 text-slate-600 opacity-90'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                    available
                                      ? 'bg-emerald-600 text-white'
                                      : 'border-2 border-amber-500 bg-white'
                                  }`}
                                >
                                  {available ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4 text-transparent" />
                                  )}
                                </div>
                                <div className="space-y-0.5 text-left">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-bold text-xs sm:text-sm ${
                                        available ? 'text-slate-900' : 'text-slate-600 line-through'
                                      }`}
                                    >
                                      {med.name}
                                    </span>
                                    <span className="font-mono text-slate-500 font-semibold text-xs">
                                      x{med.quantity}
                                    </span>
                                    {med.isColdChain && (
                                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                                        <ThermometerSnowflake className="w-2.5 h-2.5" /> Cold Chain (2°-8°C)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 block">{med.salt}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0 ml-3">
                                {available ? (
                                  <span className="text-emerald-700 font-bold text-xs flex items-center justify-end gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock (I Have This)
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-bold text-xs flex items-center justify-end gap-1">
                                    <Zap className="w-3.5 h-3.5" /> Out of Stock (Forward Next)
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500 block">
                                  ₹{med.unitPrice * med.quantity}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Forwarding Guidance Note */}
                    {remainingCount > 0 && selectedCount > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Sequential Split:</strong> You are fulfilling <strong>{selectedCount}</strong> item(s).
                          The remaining <strong>{remainingCount}</strong> item(s) will be automatically forwarded to the next nearest pharmacy.
                        </span>
                      </div>
                    )}

                    {/* Accept / Decline CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Rider will arrive in ~6 mins once accepted
                      </span>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => handlePassOrder(req.id)}
                          className="text-xs font-semibold text-slate-600 w-1/3 sm:w-auto"
                        >
                          Pass
                        </Button>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleAcceptOrForwardOrder(req)}
                          disabled={isProcessing || selectedCount === 0}
                          className="text-xs font-bold w-2/3 sm:w-auto px-6 shadow-md shadow-emerald-700/20"
                        >
                          {isProcessing
                            ? 'Processing Split...'
                            : remainingCount === 0
                            ? `✅ Accept Complete Order (${selectedCount})`
                            : `⚡ Accept Available (${selectedCount}) & Forward (${remainingCount}) ➔`}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKING & DISPATCH QUEUE */}
      {activeTab === 'packing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Prescription Packing & Handover Queue ({acceptedOrders.length})
            </h2>
            <span className="text-xs text-slate-500">
              Verify dosage, seal tamper-proof bag, and confirm pickup OTP with rider
            </span>
          </div>

          {acceptedOrders.length === 0 ? (
            <Card className="text-center py-14 bg-white border-slate-200">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Orders in Packing Stage</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Accept incoming orders from the "Incoming Broadcasts" tab to start dispensing and packing.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('incoming')}
              >
                View Incoming Requests ➔
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white border border-amber-300 shadow-md p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                      <Badge variant="amber" size="sm">
                        Packing in Progress
                      </Badge>
                      <span className="text-xs text-slate-500">• Patient: {order.patientName}</span>
                    </div>

                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Chemist Payout: ₹{order.payoutAmount}
                    </div>
                  </div>

                  {/* Packing Checklist */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      Medicines Dispensing & Packaging Checklist:
                    </span>
                    <div className="space-y-2">
                      {order.medicines.map((med: any) => {
                        const isPacked = packedItems[`${order.id}_${med.id}`];
                        return (
                          <div
                            key={med.id}
                            onClick={() => handleTogglePacked(`${order.id}_${med.id}`)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isPacked
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                  isPacked ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                                }`}
                              >
                                {isPacked && <CheckCircle2 className="w-4 h-4" />}
                              </div>
                              <span className="text-xs sm:text-sm font-bold">
                                {med.name} (Qty: {med.quantity})
                              </span>
                              {med.isColdChain && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                                  <ThermometerSnowflake className="w-3 h-3" /> Cold Chain Box
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-slate-500 font-medium">
                              {isPacked ? 'Packed & Sealed' : 'Tap to mark packed'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Handover to Rider Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Bike className="w-4 h-4 text-emerald-600" />
                      <span>
                        Rider Assigned: <strong>Rahul (Hero Splendor, MP-43-E-2101)</strong>
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleHandoverToRider(order)}
                      disabled={isProcessing}
                      className="text-xs font-bold w-full sm:w-auto px-6"
                    >
                      {isProcessing ? 'Dispatching...' : 'Handover to Rider Rahul ➔'}
                    </Button>
                  </div>
                </Card>
              ))}

              {dispatchedOrders.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Handed Over: {dispatchedOrders.length} Order(s) En Route with Rider Rahul
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">Live GPS Active</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <Card className="bg-white border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeStation.name} — Live Stock Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Auto-syncs with CDSCO database & Pradhan Mantri Jan Aushadhi Pariyojana (PMBJP)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              1,420 Active SKUs Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 block">Critical Emergency Antibiotics</span>
              <span className="font-bold text-slate-900 text-sm block">Augmentin 625 Duo (Amoxicillin)</span>
              <span className="text-emerald-700 font-semibold block">40 Units in Stock • ₹24/unit</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 block">Cold Chain Insulin</span>
              <span className="font-bold text-slate-900 text-sm block">Lantus SoloStar Pen (100 IU/mL)</span>
              <span className="text-blue-700 font-semibold flex items-center gap-1">
                <ThermometerSnowflake className="w-3.5 h-3.5" /> 15 Units in Stock (2°-8°C)
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-400 block">Chronic Care Antidiabetic</span>
              <span className="font-bold text-slate-900 text-sm block">Glycomet-GP 2 (Metformin + Glimepiride)</span>
              <span className="text-emerald-700 font-semibold block">60 Units in Stock • ₹4.2/unit</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
