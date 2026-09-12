import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  MapPin
} from 'lucide-react';
import { Order } from '../types';
import { ApiService } from '../services/api';
import { Language, translations } from '../i18n';

interface OrdersViewProps {
  orders: Order[];
  lang: Language;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onOrderUpdated: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  lang,
  onNavigateTab,
  onOrderUpdated
}) => {
  const t = translations[lang];
  const [advancingOrderId, setAdvancingOrderId] = useState<string | null>(null);

  const steps: Order['deliveryStatus'][] = [
    'ORDER_PLACED',
    'DISPATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'PAYMENT_RELEASED'
  ];

  const handleAdvance = async (orderId: string) => {
    setAdvancingOrderId(orderId);
    try {
      const res = await ApiService.advanceOrderStatus(orderId);
      if (res.success) {
        onOrderUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdvancingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Orders, Cold-Chain Logistics &amp; Escrow Settlement
            </h2>
            <p className="text-xs text-stone-400">
              5-step end-to-end transparent delivery timeline with automated bank transfer upon buyer sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const currentDeliveryStatus = order?.deliveryStatus || 'ORDER_PLACED';
          const currentStepIndex = steps.indexOf(currentDeliveryStatus);
          const isComplete = currentDeliveryStatus === 'PAYMENT_RELEASED';

          return (
            <div
              key={order.orderId}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm space-y-6"
            >
              {/* Top Order Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ORDER: {order.orderId}
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="font-mono text-xs text-stone-400">
                      BATCH: {order.batchId}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    {order.quantity} {order.unit} {order.crop} ({order.grade})
                  </h3>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Buyer: <span className="text-stone-200 font-semibold">{order.buyerName}</span> ({order.buyerType})
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-semibold">Total Escrow Value</span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center space-x-1 justify-end text-[10px] text-emerald-300 font-bold mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Bank Escrow Locked</span>
                  </div>
                </div>
              </div>

              {/* 5-Step Delivery Timeline Graphic */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                    Live Logistics &amp; Settlement Timeline
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    {currentDeliveryStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {steps.map((st, idx) => {
                    const isPassed = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={st} className="space-y-2 text-center">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isPassed ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-stone-800'
                          }`}
                        />
                        <div className="text-center">
                          <span
                            className={`text-[10px] font-bold block ${
                              isCurrent
                                ? 'text-emerald-400'
                                : isPassed
                                ? 'text-stone-300'
                                : 'text-stone-600'
                            }`}
                          >
                            Step {idx + 1}
                          </span>
                          <span
                            className={`text-[9px] block truncate ${
                              isCurrent
                                ? 'text-white font-extrabold'
                                : isPassed
                                ? 'text-stone-400'
                                : 'text-stone-700'
                            }`}
                          >
                            {st === 'ORDER_PLACED'
                              ? 'Order Placed'
                              : st === 'DISPATCHED'
                              ? 'Dispatched'
                              : st === 'IN_TRANSIT'
                              ? 'In Transit'
                              : st === 'DELIVERED'
                              ? 'Delivered'
                              : 'Payment Released'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Logs / Progress Details */}
              <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-800 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Verification Logs &amp; Trace Telemetry
                </div>
                <div className="space-y-1 text-xs text-stone-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Order Created: </strong> {new Date(order.createdAt).toLocaleDateString()} — Escrow payment secured in ICICI Bank Agronauts Escrow.
                    </span>
                  </div>

                  {currentStepIndex >= 1 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Dispatch Manifest: </strong> Loaded into Reefer Vehicle MH-15-EG-4421. Pre-cooling to 12°C verified.
                      </span>
                    </div>
                  )}

                  {currentStepIndex >= 2 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <strong>In Transit: </strong> En-route to {order.buyerName} facility. GPS active; temperature stable at 11.8°C.
                      </span>
                    </div>
                  )}

                  {currentStepIndex >= 3 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Delivered: </strong> Buyer dock reception confirmed. Digital optical quality grading verified matching Grade {order.grade}.
                      </span>
                    </div>
                  )}

                  {currentStepIndex >= 4 && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300 font-bold">
                        <strong>Settlement Complete: </strong> ₹{order.totalAmount.toLocaleString('en-IN')} deposited to Farmer Bank Account via RTGS (Ref: UTIB0002931).
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => onNavigateTab('traceability', order.batchId)}
                  className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-sky-400 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Full Supply Chain Traceability</span>
                </button>

                {!isComplete ? (
                  <button
                    onClick={() => handleAdvance(order.orderId)}
                    disabled={advancingOrderId === order.orderId}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center space-x-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>
                      {advancingOrderId === order.orderId
                        ? 'Updating Status...'
                        : `Advance Status to: ${
                            currentStepIndex === 0
                              ? 'Dispatched'
                              : currentStepIndex === 1
                              ? 'In Transit'
                              : currentStepIndex === 2
                              ? 'Delivered'
                              : 'Payment Released'
                          }`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Order Complete &amp; Settled</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
