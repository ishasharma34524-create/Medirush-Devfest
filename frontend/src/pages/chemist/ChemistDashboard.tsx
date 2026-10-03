import React, { useState } from 'react';
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
  Search,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  confirmOrderApi,
  dispatchOrderApi,
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

export const ChemistDashboard: React.FC<{ onSwitchToPatient: () => void }> = ({
  onSwitchToPatient,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'packing' | 'inventory'>('incoming');
  const [acceptedOrders, setAcceptedOrders] = useState<any[]>([]);
  const [dispatchedOrders, setDispatchedOrders] = useState<any[]>([]);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Incoming broadcast request list
  const [incomingRequests, setIncomingRequests] = useState<ChemistIncomingOrder[]>([
    {
      id: 'req_indore_001',
      orderNumber: 'MR-9402',
      patientName: 'Rahul Sharma',
      patientPhone: '+91-98260-12345',
      patientAddress: 'Flat 204, Greater Kailash Road, Old Palasia, Indore',
      distanceKm: 1.2,
      urgency: 'CRITICAL_COLD_CHAIN',
      timeReceived: 'Just now (12s ago)',
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

  // Handle chemist accepting an incoming broadcast
  const handleAcceptOrder = async (order: ChemistIncomingOrder) => {
    try {
      setIsProcessing(true);
      // Try to notify real backend if active order exists
      try {
        await confirmOrderApi(order.id, '650000000000000000000001');
      } catch {
        // Continue seamlessly in demo mode
      }

      // Move to packing queue
      setAcceptedOrders((prev) => [order, ...prev]);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== order.id));
      setActiveTab('packing');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject / Pass order to next pharmacy
  const handlePassOrder = (orderId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== orderId));
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
        // Continue seamlessly in demo mode
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
                  Sanjeevani Medicos & Surgicals
                </h1>
                <Badge variant="emerald" size="sm">
                  Partner Verified
                </Badge>
                <span className="text-[11px] font-mono text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  DL: MP-IND-2024-8491
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>12/A Greater Kailash Road, Old Palasia, Indore • Central Hub</span>
              </p>
            </div>
          </div>

          {/* Online Toggle & Patient Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{isOnline ? 'Accepting Broadcasts (Online)' : 'Store Offline'}</span>
              <Power className="w-3.5 h-3.5 ml-1" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToPatient}
              className="text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Switch to Patient View
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
            <span className="text-[10px] text-slate-400 block mt-0.5">Avg pack time: 4.2m</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Cold Chain Storage</span>
            <span className="text-lg font-black text-blue-400 flex items-center gap-1">
              <ThermometerSnowflake className="w-4 h-4" /> 3.8°C
            </span>
            <span className="text-[10px] text-blue-300/80 block mt-0.5">Sensor Active (2°-8°C)</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block mb-0.5">Fulfillment Score</span>
            <span className="text-lg font-black text-amber-400">99.2%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Top 5% in Indore</span>
          </div>
        </div>
      </div>

      {/* Chemist Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'incoming'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Incoming Broadcasts</span>
          {incomingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('packing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Live Emergency Broadcasts ({incomingRequests.length})
            </h2>
            <span className="text-xs text-slate-500">
              Auto-refreshes • First to accept locks fulfillment
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <Card className="text-center py-14 bg-white border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All Broadcasts Handled!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                No pending medicine requests in your radius right now. New emergency orders will chime automatically.
              </p>
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
                      ],
                    },
                  ])
                }
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Simulate New Incoming Request
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
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
                        <Badge variant="emerald" size="sm" icon={<ThermometerSnowflake className="w-3 h-3 text-blue-600" />}>
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
                    </div>
                    <div>
                      <span className="text-slate-400 block">Verified Prescription</span>
                      <span className="font-semibold text-slate-700 block">{req.prescriptionDoctor}</span>
                      <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> Tele-verified via MediRush AI
                      </span>
                    </div>
                  </div>

                  {/* Medicines Stock Availability Check */}
                  <div className="space-y-2 mb-5">
                    <span className="text-xs font-bold text-slate-700 block">
                      Requested Items ({req.medicines.length}):
                    </span>
                    <div className="space-y-2">
                      {req.medicines.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{med.name}</span>
                              <span className="font-mono text-slate-500 font-semibold">x{med.quantity}</span>
                              {med.isColdChain && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                                  <ThermometerSnowflake className="w-2.5 h-2.5" /> 2°-8°C
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">{med.salt}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({med.availableQty} units)
                            </span>
                            <span className="text-[11px] text-slate-400">₹{med.unitPrice * med.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                        onClick={() => handleAcceptOrder(req)}
                        disabled={isProcessing}
                        className="text-xs font-bold w-2/3 sm:w-auto px-6 shadow-md shadow-emerald-700/20"
                      >
                        {isProcessing ? 'Locking Order...' : '✅ Accept & Start Packing'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKING & RIDER HANDOVER */}
      {activeTab === 'packing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Orders Under Packing & Dispatched ({acceptedOrders.length + dispatchedOrders.length})
            </h2>
            <span className="text-xs text-slate-500">Tick items as you place them in the bag</span>
          </div>

          {acceptedOrders.length === 0 && dispatchedOrders.length === 0 ? (
            <Card className="text-center py-12 bg-white border-slate-200">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Orders in Packing Queue</p>
              <p className="text-xs text-slate-400 mt-1">Accept an incoming broadcast from the Incoming tab to begin fulfillment.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Active Packing Orders */}
              {acceptedOrders.map((order) => (
                <Card key={order.id} className="bg-white border border-amber-300 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                        <Badge variant="amber" size="sm">
                          Packing in Progress
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">Deliver to: {order.patientName} • {order.patientAddress}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Earnings</span>
                      <span className="text-base font-bold text-emerald-700">₹{order.payoutAmount}</span>
                    </div>
                  </div>

                  {/* Pharmacist Checklist */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Pharmacist Verification Checklist:</span>
                    {order.medicines.map((med: any) => {
                      const isChecked = Boolean(packedItems[med.id]);
                      return (
                        <div
                          key={med.id}
                          onClick={() => handleTogglePacked(med.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                              <span className="font-bold block">{med.name} (x{med.quantity})</span>
                              <span className="text-[11px] text-slate-500">{med.salt}</span>
                            </div>
                          </div>

                          {med.isColdChain && (
                            <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <ThermometerSnowflake className="w-3 h-3" /> Ice Pack Attached
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rider Handover Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Bike className="w-4 h-4 text-emerald-600" />
                      <span><strong>Rider Rahul (Hero Splendor MP-43-E-2101)</strong> is 2 mins away</span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleHandoverToRider(order)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto text-xs font-bold px-6 shadow-md shadow-emerald-700/20"
                    >
                      {isProcessing ? 'Dispatching...' : '🛵 Mark Packed & Handover to Rider'}
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Already Dispatched Orders */}
              {dispatchedOrders.map((order, idx) => (
                <Card key={idx} className="bg-slate-50 border border-slate-200 p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Order {order.orderNumber} Handed Over to Rider
                    </span>
                    <span className="text-slate-400 font-mono">Dispatched at {order.dispatchedAt}</span>
                  </div>
                  <div className="text-slate-600">
                    Rider <strong>{order.rider.name}</strong> ({order.rider.vehicle} • {order.rider.vehicleNumber}) has picked up the sealed package.
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <Card className="bg-white border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Store Stock & Cold Chain Inventory</h3>
              <p className="text-xs text-slate-500">Live quantities synced with the MediRush Multi-Pharmacy Router</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search salt or brand..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { name: 'Lantus SoloStar Pen (100 IU/mL)', salt: 'Insulin Glargine', qty: 15, cold: true, status: 'In Stock' },
              { name: 'Augmentin 625 Duo', salt: 'Amoxicillin + Clavulanate', qty: 40, cold: false, status: 'In Stock' },
              { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650mg', qty: 100, cold: false, status: 'In Stock' },
              { name: 'Azithral 500', salt: 'Azithromycin 500mg', qty: 25, cold: false, status: 'In Stock' },
              { name: 'Metformin 500mg', salt: 'Metformin Hydrochloride', qty: 80, cold: false, status: 'In Stock' },
              { name: 'Telma-H', salt: 'Telmisartan + Hydrochlorothiazide', qty: 30, cold: false, status: 'In Stock' },
            ].map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    {item.cold && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                        Cold Chain 2°-8°C
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">{item.salt}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-700">{item.qty} Units</span>
                  <Badge variant="emerald" size="sm">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
